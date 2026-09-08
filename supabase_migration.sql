-- ====================================================================
-- Supabase Database Migration Script for School Website
-- Project URL: https://vulhivjvdeevpkjcibte.supabase.co
-- ====================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. ADMINS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- --------------------------------------------------------------------
-- 2. STUDENTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  father_name TEXT,
  class TEXT NOT NULL,
  roll_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- --------------------------------------------------------------------
-- 3. TEACHERS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- --------------------------------------------------------------------
-- 4. NOTICES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- --------------------------------------------------------------------
-- 5. GALLERY TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- --------------------------------------------------------------------
-- 6. TESTIMONIALS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- --------------------------------------------------------------------
-- 7. CONTACT_MESSAGES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ====================================================================
-- HELPER FUNCTION FOR RLS (Admin Verification)
-- ====================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ====================================================================
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- ROW LEVEL SECURITY POLICIES
-- ====================================================================

-- 1. POLICIES FOR ADMINS
DROP POLICY IF EXISTS "Admins can view admins" ON public.admins;
CREATE POLICY "Admins can view admins"
  ON public.admins FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert admins" ON public.admins;
CREATE POLICY "Admins can insert admins"
  ON public.admins FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- 2. POLICIES FOR STUDENTS (Public view, Admin insert/update/delete)
DROP POLICY IF EXISTS "Public can view students" ON public.students;
CREATE POLICY "Public can view students"
  ON public.students FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage students" ON public.students;
CREATE POLICY "Admins can manage students"
  ON public.students FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. POLICIES FOR TEACHERS (Public view, Admin insert/update/delete)
DROP POLICY IF EXISTS "Public can view teachers" ON public.teachers;
CREATE POLICY "Public can view teachers"
  ON public.teachers FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage teachers" ON public.teachers;
CREATE POLICY "Admins can manage teachers"
  ON public.teachers FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. POLICIES FOR NOTICES (Public view, Admin insert/update/delete)
DROP POLICY IF EXISTS "Public can view notices" ON public.notices;
CREATE POLICY "Public can view notices"
  ON public.notices FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage notices" ON public.notices;
CREATE POLICY "Admins can manage notices"
  ON public.notices FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. POLICIES FOR GALLERY (Public view, Admin insert/update/delete)
DROP POLICY IF EXISTS "Public can view gallery" ON public.gallery;
CREATE POLICY "Public can view gallery"
  ON public.gallery FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage gallery" ON public.gallery;
CREATE POLICY "Admins can manage gallery"
  ON public.gallery FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6. POLICIES FOR TESTIMONIALS (Public view, Admin insert/update/delete)
DROP POLICY IF EXISTS "Public can view testimonials" ON public.testimonials;
CREATE POLICY "Public can view testimonials"
  ON public.testimonials FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
CREATE POLICY "Admins can manage testimonials"
  ON public.testimonials FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 7. POLICIES FOR CONTACT_MESSAGES (Public insert, Admin read/manage)
DROP POLICY IF EXISTS "Anyone can submit contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact message"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;
CREATE POLICY "Admins can view contact messages"
  ON public.contact_messages FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage contact messages" ON public.contact_messages;
CREATE POLICY "Admins can manage contact messages"
  ON public.contact_messages FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
