-- ====================================================================
-- KSM ADMIN SQL: SET PASSWORD, CONFIRM EMAIL & GRANT PERMISSIONS
-- Copy and Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/vulhivjvdeevpkjcibte/sql
-- ====================================================================

-- 1. Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Confirm email and set dedicated Admin Password to: KsmAdmin@2026#
-- (confirmed_at is omitted because it is automatically generated from email_confirmed_at)
UPDATE auth.users
SET 
  encrypted_password = crypt('KsmAdmin@2026#', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  last_sign_in_at = now(),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}',
  raw_user_meta_data = '{}'
WHERE email = 'quratulainm244@gmail.com';

-- 3. Ensure public.admins table exists
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Insert all user records for quratulainm244@gmail.com into public.admins
INSERT INTO public.admins (user_id)
SELECT id FROM auth.users WHERE email = 'quratulainm244@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- Also insert your specific UID directly
INSERT INTO public.admins (user_id)
VALUES ('fdda878b-997c-4757-9262-fceaa5616466')
ON CONFLICT (user_id) DO NOTHING;

-- 5. Grant table and schema privileges to anon and authenticated roles
-- (This eliminates 401 "permission denied for table ..." errors)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;
