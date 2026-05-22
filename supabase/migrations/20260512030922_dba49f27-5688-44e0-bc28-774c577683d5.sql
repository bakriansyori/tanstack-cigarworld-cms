
-- Fix search_path on touch_updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Revoke EXECUTE on SECURITY DEFINER helpers from public/anon/authenticated.
-- These are only meant to be used inside RLS policies, not via PostgREST.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

-- Restrict media bucket listing: replace broad SELECT with staff-only listing.
-- Files remain accessible via direct public URL since bucket.public = true.
DROP POLICY IF EXISTS "media_storage_public_read" ON storage.objects;
CREATE POLICY "media_storage_staff_list" ON storage.objects
  FOR SELECT USING (bucket_id = 'media' AND public.is_staff(auth.uid()));
