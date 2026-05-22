CREATE SCHEMA IF NOT EXISTS app_private;

CREATE OR REPLACE FUNCTION app_private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION app_private.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'editor')
  );
$$;

GRANT USAGE ON SCHEMA app_private TO anon, authenticated;
GRANT EXECUTE ON FUNCTION app_private.has_role(uuid, public.app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION app_private.is_staff(uuid) TO anon, authenticated;

DROP POLICY IF EXISTS "profiles_self_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "roles_self_view" ON public.user_roles;
DROP POLICY IF EXISTS "roles_admin_manage" ON public.user_roles;
DROP POLICY IF EXISTS "products_public_read" ON public.products;
DROP POLICY IF EXISTS "products_staff_insert" ON public.products;
DROP POLICY IF EXISTS "products_staff_update" ON public.products;
DROP POLICY IF EXISTS "products_admin_delete" ON public.products;
DROP POLICY IF EXISTS "pages_public_read" ON public.pages_content;
DROP POLICY IF EXISTS "pages_staff_insert" ON public.pages_content;
DROP POLICY IF EXISTS "pages_staff_update" ON public.pages_content;
DROP POLICY IF EXISTS "pages_admin_delete" ON public.pages_content;
DROP POLICY IF EXISTS "posts_public_read" ON public.posts;
DROP POLICY IF EXISTS "posts_staff_insert" ON public.posts;
DROP POLICY IF EXISTS "posts_staff_update" ON public.posts;
DROP POLICY IF EXISTS "posts_admin_delete" ON public.posts;
DROP POLICY IF EXISTS "media_public_read" ON public.media;
DROP POLICY IF EXISTS "media_staff_insert" ON public.media;
DROP POLICY IF EXISTS "media_staff_delete" ON public.media;

CREATE POLICY "profiles_self_select" ON public.profiles FOR SELECT USING (auth.uid() = id OR app_private.is_staff(auth.uid()));
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (app_private.has_role(auth.uid(),'admin'));

CREATE POLICY "roles_self_view" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR app_private.has_role(auth.uid(),'admin'));
CREATE POLICY "roles_admin_manage" ON public.user_roles FOR ALL USING (app_private.has_role(auth.uid(),'admin')) WITH CHECK (app_private.has_role(auth.uid(),'admin'));

CREATE POLICY "products_public_read" ON public.products FOR SELECT USING (status = 'published' OR app_private.is_staff(auth.uid()));
CREATE POLICY "products_staff_insert" ON public.products FOR INSERT WITH CHECK (app_private.is_staff(auth.uid()));
CREATE POLICY "products_staff_update" ON public.products FOR UPDATE USING (app_private.is_staff(auth.uid()));
CREATE POLICY "products_admin_delete" ON public.products FOR DELETE USING (app_private.has_role(auth.uid(),'admin'));

CREATE POLICY "pages_public_read" ON public.pages_content FOR SELECT USING (true);
CREATE POLICY "pages_staff_insert" ON public.pages_content FOR INSERT WITH CHECK (app_private.is_staff(auth.uid()));
CREATE POLICY "pages_staff_update" ON public.pages_content FOR UPDATE USING (app_private.is_staff(auth.uid()));
CREATE POLICY "pages_admin_delete" ON public.pages_content FOR DELETE USING (app_private.has_role(auth.uid(),'admin'));

CREATE POLICY "posts_public_read" ON public.posts FOR SELECT USING (status = 'published' OR app_private.is_staff(auth.uid()));
CREATE POLICY "posts_staff_insert" ON public.posts FOR INSERT WITH CHECK (app_private.is_staff(auth.uid()));
CREATE POLICY "posts_staff_update" ON public.posts FOR UPDATE USING (app_private.is_staff(auth.uid()));
CREATE POLICY "posts_admin_delete" ON public.posts FOR DELETE USING (app_private.has_role(auth.uid(),'admin'));

CREATE POLICY "media_public_read" ON public.media FOR SELECT USING (true);
CREATE POLICY "media_staff_insert" ON public.media FOR INSERT WITH CHECK (app_private.is_staff(auth.uid()));
CREATE POLICY "media_staff_delete" ON public.media FOR DELETE USING (app_private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "media_storage_staff_list" ON storage.objects;
DROP POLICY IF EXISTS "media_storage_staff_insert" ON storage.objects;
DROP POLICY IF EXISTS "media_storage_staff_update" ON storage.objects;
DROP POLICY IF EXISTS "media_storage_staff_delete" ON storage.objects;

CREATE POLICY "media_storage_staff_list" ON storage.objects
  FOR SELECT USING (bucket_id = 'media' AND app_private.is_staff(auth.uid()));
CREATE POLICY "media_storage_staff_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media' AND app_private.is_staff(auth.uid()));
CREATE POLICY "media_storage_staff_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'media' AND app_private.is_staff(auth.uid()));
CREATE POLICY "media_storage_staff_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'media' AND app_private.is_staff(auth.uid()));

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon, authenticated;