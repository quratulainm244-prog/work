-- ====================================================================
-- SUPABASE ADMIN SETUP & RLS SECURITY
-- Project: Kindergarten Saadia's Montessori School (KSM)
-- Admin User: quratulainm244@gmail.com
-- Admin UID:  fdda878b-997c-4757-9262-fceaa5616466
-- ====================================================================

-- 1. Ensure public.admins table exists with exact columns: id, user_id, created_at
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Helper function to check if the current user's UID exists in public.admins
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Enable Row Level Security (RLS) on public.admins
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Users can check their own admin status; existing admins can view all admins
DROP POLICY IF EXISTS "Allow user to check admin status" ON public.admins;
CREATE POLICY "Allow user to check admin status"
  ON public.admins FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- 5. RLS Policy: ONLY existing admins can insert new admins (normal users CANNOT insert themselves)
DROP POLICY IF EXISTS "Only admins can insert admins" ON public.admins;
CREATE POLICY "Only admins can insert admins"
  ON public.admins FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- 6. RLS Policy: ONLY existing admins can update admins
DROP POLICY IF EXISTS "Only admins can update admins" ON public.admins;
CREATE POLICY "Only admins can update admins"
  ON public.admins FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 7. RLS Policy: ONLY existing admins can delete admins
DROP POLICY IF EXISTS "Only admins can delete admins" ON public.admins;
CREATE POLICY "Only admins can delete admins"
  ON public.admins FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 8. Insert your admin UID into public.admins (uses only user_id column)
INSERT INTO public.admins (user_id)
VALUES ('fdda878b-997c-4757-9262-fceaa5616466')
ON CONFLICT (user_id) DO NOTHING;

-- 9. Set your dedicated Admin Password: KsmAdmin@2026#
-- (You can change 'KsmAdmin@2026#' to any password you prefer)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE auth.users
SET 
  encrypted_password = crypt('KsmAdmin@2026#', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE id = 'fdda878b-997c-4757-9262-fceaa5616466';

