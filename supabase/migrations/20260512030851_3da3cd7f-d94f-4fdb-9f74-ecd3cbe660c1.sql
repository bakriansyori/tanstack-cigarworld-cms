
-- ============== ENUM ROLES ==============
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');
CREATE TYPE public.content_status AS ENUM ('draft', 'published');

-- ============== PROFILES ==============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============== USER ROLES ==============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============== HAS_ROLE FUNCTION ==============
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- editor OR admin helper
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','editor')
  );
$$;

-- ============== PRODUCTS ==============
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2),
  category TEXT,
  origin TEXT,
  strength TEXT,
  main_image TEXT,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  status content_status NOT NULL DEFAULT 'draft',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- ============== PAGES_CONTENT ==============
CREATE TABLE public.pages_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  section TEXT,
  label TEXT,
  value TEXT,
  field_type TEXT NOT NULL DEFAULT 'text',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pages_content ENABLE ROW LEVEL SECURITY;

-- ============== POSTS ==============
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  cover_image TEXT,
  content TEXT,
  status content_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- ============== MEDIA ==============
CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  path TEXT NOT NULL,
  filename TEXT,
  mime_type TEXT,
  size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- ============== UPDATED_AT TRIGGER ==============
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_posts_updated BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_pages_updated BEFORE UPDATE ON public.pages_content
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============== AUTO-CREATE PROFILE + FIRST USER = ADMIN ==============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_first BOOLEAN;
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)));

  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles) INTO is_first;
  IF is_first THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'editor');
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============== RLS POLICIES ==============

-- profiles
CREATE POLICY "profiles_self_select" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_staff(auth.uid()));
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (public.has_role(auth.uid(),'admin'));

-- user_roles
CREATE POLICY "roles_self_view" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "roles_admin_manage" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- products: public reads published, staff manages
CREATE POLICY "products_public_read" ON public.products FOR SELECT USING (status = 'published' OR public.is_staff(auth.uid()));
CREATE POLICY "products_staff_insert" ON public.products FOR INSERT WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "products_staff_update" ON public.products FOR UPDATE USING (public.is_staff(auth.uid()));
CREATE POLICY "products_admin_delete" ON public.products FOR DELETE USING (public.has_role(auth.uid(),'admin'));

-- pages_content: public reads, staff manages
CREATE POLICY "pages_public_read" ON public.pages_content FOR SELECT USING (true);
CREATE POLICY "pages_staff_insert" ON public.pages_content FOR INSERT WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "pages_staff_update" ON public.pages_content FOR UPDATE USING (public.is_staff(auth.uid()));
CREATE POLICY "pages_admin_delete" ON public.pages_content FOR DELETE USING (public.has_role(auth.uid(),'admin'));

-- posts
CREATE POLICY "posts_public_read" ON public.posts FOR SELECT USING (status = 'published' OR public.is_staff(auth.uid()));
CREATE POLICY "posts_staff_insert" ON public.posts FOR INSERT WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "posts_staff_update" ON public.posts FOR UPDATE USING (public.is_staff(auth.uid()));
CREATE POLICY "posts_admin_delete" ON public.posts FOR DELETE USING (public.has_role(auth.uid(),'admin'));

-- media
CREATE POLICY "media_public_read" ON public.media FOR SELECT USING (true);
CREATE POLICY "media_staff_insert" ON public.media FOR INSERT WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "media_staff_delete" ON public.media FOR DELETE USING (public.is_staff(auth.uid()));

-- ============== STORAGE BUCKET ==============
INSERT INTO storage.buckets (id, name, public) VALUES ('media','media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "media_storage_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "media_storage_staff_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND public.is_staff(auth.uid()));
CREATE POLICY "media_storage_staff_update" ON storage.objects FOR UPDATE USING (bucket_id = 'media' AND public.is_staff(auth.uid()));
CREATE POLICY "media_storage_staff_delete" ON storage.objects FOR DELETE USING (bucket_id = 'media' AND public.is_staff(auth.uid()));
