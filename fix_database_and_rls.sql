-- ====================================================================
-- SUPABASE DATABASE REPAIR & FULL MIGRATION SCRIPT
-- Kindergarten Saadia's Montessori School (Haripur)
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/vulhivjvdeevpkjcibte/sql
-- ====================================================================

-- 1. Enable UUID & pgcrypto extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- --------------------------------------------------------------------
-- 2. ADMINS TABLE & COLUMNS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT,
  role TEXT DEFAULT 'super_admin' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'super_admin';
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Ensure admin user exists in admins table
INSERT INTO public.admins (user_id, email, role)
VALUES ('fdda878b-997c-4757-9262-fceaa5616466', 'quratulainm244@gmail.com', 'super_admin')
ON CONFLICT (user_id) DO UPDATE 
SET email = EXCLUDED.email, role = EXCLUDED.role;

-- --------------------------------------------------------------------
-- 3. ADMIN AUDIT LOGS TABLE & COLUMNS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email TEXT,
  action TEXT NOT NULL DEFAULT '',
  entity TEXT NOT NULL DEFAULT '',
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.admin_audit_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.admin_audit_logs ADD COLUMN IF NOT EXISTS admin_email TEXT;
ALTER TABLE public.admin_audit_logs ADD COLUMN IF NOT EXISTS action TEXT DEFAULT '';
ALTER TABLE public.admin_audit_logs ADD COLUMN IF NOT EXISTS entity TEXT DEFAULT '';
ALTER TABLE public.admin_audit_logs ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.admin_audit_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- --------------------------------------------------------------------
-- 4. SITE SETTINGS TABLE & COLUMNS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS key TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS value JSONB;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Ensure key is unique
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'site_settings_key_key'
  ) THEN
    ALTER TABLE public.site_settings ADD CONSTRAINT site_settings_key_key UNIQUE (key);
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- --------------------------------------------------------------------
-- 5. PROGRAMS TABLE & COLUMNS (Fixes column programs.sort_order does not exist)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number TEXT NOT NULL DEFAULT '01',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  age_group TEXT,
  icon TEXT DEFAULT '🌟',
  sort_order INT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS number TEXT DEFAULT '01';
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS age_group TEXT;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '🌟';
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Seed initial programs if empty
INSERT INTO public.programs (number, title, description, age_group, icon, sort_order, is_active)
SELECT '01', 'Early Learning', 'Fun, creative and engaging learning experiences for young children.', '2.5 - 4 Years', '🌱', 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.programs LIMIT 1);

INSERT INTO public.programs (number, title, description, age_group, icon, sort_order, is_active)
SELECT '02', 'Primary Education', 'Building strong academic and personal foundations.', '4 - 6 Years', '📚', 2, true
WHERE (SELECT COUNT(*) FROM public.programs) = 1;

INSERT INTO public.programs (number, title, description, age_group, icon, sort_order, is_active)
SELECT '03', 'Student Development', 'Encouraging confidence, creativity and important life skills.', 'All Ages', '⭐', 3, true
WHERE (SELECT COUNT(*) FROM public.programs) = 2;

-- --------------------------------------------------------------------
-- 6. TEACHERS TABLE & COLUMNS (Fixes column teachers.sort_order does not exist)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  photo_url TEXT,
  bio TEXT,
  sort_order INT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- --------------------------------------------------------------------
-- 7. GALLERY TABLE & COLUMNS (Fixes column gallery.sort_order does not exist)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'campus',
  sort_order INT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'campus';
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Seed initial gallery items if empty
INSERT INTO public.gallery (title, image_url, category, sort_order, is_active)
SELECT 'Learning Together', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80', 'campus', 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.gallery LIMIT 1);

INSERT INTO public.gallery (title, image_url, category, sort_order, is_active)
SELECT 'Young Learners', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80', 'activities', 2, true
WHERE (SELECT COUNT(*) FROM public.gallery) = 1;

INSERT INTO public.gallery (title, image_url, category, sort_order, is_active)
SELECT 'Creative Activities', 'https://images.unsplash.com/photo-1560785496-3c9d27877182?auto=format&fit=crop&w=900&q=80', 'activities', 3, true
WHERE (SELECT COUNT(*) FROM public.gallery) = 2;

INSERT INTO public.gallery (title, image_url, category, sort_order, is_active)
SELECT 'Classroom Life', 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=900&q=80', 'campus', 4, true
WHERE (SELECT COUNT(*) FROM public.gallery) = 3;

-- --------------------------------------------------------------------
-- 8. TESTIMONIALS TABLE & COLUMNS (Fixes column testimonials.sort_order does not exist)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  relationship TEXT DEFAULT 'KSM Parent',
  message TEXT NOT NULL,
  rating INT DEFAULT 5,
  sort_order INT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS relationship TEXT DEFAULT 'KSM Parent';
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS rating INT DEFAULT 5;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Seed initial testimonials if empty
INSERT INTO public.testimonials (name, relationship, message, rating, sort_order, is_active)
SELECT 'KSM Parent', 'KSM Parent', 'A warm and caring environment where children can learn with confidence.', 5, 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.testimonials LIMIT 1);

INSERT INTO public.testimonials (name, relationship, message, rating, sort_order, is_active)
SELECT 'KSM Family', 'KSM Family', 'The focus on early development, activities and individual attention makes learning enjoyable.', 5, 2, true
WHERE (SELECT COUNT(*) FROM public.testimonials) = 1;

INSERT INTO public.testimonials (name, relationship, message, rating, sort_order, is_active)
SELECT 'KSM Parent', 'KSM Parent', 'A positive beginning for a child''s educational journey.', 5, 3, true
WHERE (SELECT COUNT(*) FROM public.testimonials) = 2;

-- --------------------------------------------------------------------
-- 9. INQUIRIES & ADMISSIONS TABLE & COLUMNS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_name TEXT NOT NULL DEFAULT '',
  contact_info TEXT NOT NULL DEFAULT '',
  child_name TEXT,
  child_age TEXT,
  message TEXT,
  status TEXT DEFAULT 'new' NOT NULL,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS parent_name TEXT DEFAULT '';
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS contact_info TEXT DEFAULT '';
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS child_name TEXT;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS child_age TEXT;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- --------------------------------------------------------------------
-- 10. CONTACT MESSAGES TABLE & COLUMNS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'unread';
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- --------------------------------------------------------------------
-- 11. NOTICES & EVENTS TABLES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  badge TEXT DEFAULT 'Announcement',
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  location TEXT DEFAULT 'KSM Campus',
  description TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ====================================================================
-- 12. HELPER FUNCTION FOR ADMIN CHECK
-- ====================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.uid() = 'fdda878b-997c-4757-9262-fceaa5616466'::uuid
    OR EXISTS (
      SELECT 1 FROM public.admins WHERE user_id = auth.uid()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 13.1 ADMINS
DROP POLICY IF EXISTS "Anyone authenticated can check admin" ON public.admins;
CREATE POLICY "Anyone authenticated can check admin"
  ON public.admins FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage admins" ON public.admins;
CREATE POLICY "Admins can manage admins"
  ON public.admins FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 13.2 AUDIT LOGS
DROP POLICY IF EXISTS "Authenticated can insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Authenticated can insert audit logs"
  ON public.admin_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 13.3 SITE SETTINGS (Public can read, Admins can write)
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings"
  ON public.site_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
CREATE POLICY "Admins can manage site settings"
  ON public.site_settings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 13.4 PROGRAMS (Public can read active, Admins can do everything)
DROP POLICY IF EXISTS "Public can view programs" ON public.programs;
CREATE POLICY "Public can view programs"
  ON public.programs FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage programs" ON public.programs;
CREATE POLICY "Admins can manage programs"
  ON public.programs FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 13.5 TEACHERS (Public can read, Admins can do everything)
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

-- 13.6 GALLERY (Public can read, Admins can do everything)
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

-- 13.7 TESTIMONIALS (Public can read, Admins can do everything)
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

-- 13.8 INQUIRIES (Public can insert, Admins can read and update)
DROP POLICY IF EXISTS "Public can submit inquiries" ON public.inquiries;
CREATE POLICY "Public can submit inquiries"
  ON public.inquiries FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage inquiries" ON public.inquiries;
CREATE POLICY "Admins can manage inquiries"
  ON public.inquiries FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 13.9 CONTACT MESSAGES (Public can insert, Admins can read and update)
DROP POLICY IF EXISTS "Public can submit contact messages" ON public.contact_messages;
CREATE POLICY "Public can submit contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage contact messages" ON public.contact_messages;
CREATE POLICY "Admins can manage contact messages"
  ON public.contact_messages FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 13.10 NOTICES & EVENTS
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

DROP POLICY IF EXISTS "Public can view events" ON public.events;
CREATE POLICY "Public can view events"
  ON public.events FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
CREATE POLICY "Admins can manage events"
  ON public.events FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ====================================================================
-- 14. STORAGE BUCKET: school-assets
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('school-assets', 'school-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can view school assets" ON storage.objects;
CREATE POLICY "Public can view school assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'school-assets');

DROP POLICY IF EXISTS "Admins can upload school assets" ON storage.objects;
CREATE POLICY "Admins can upload school assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'school-assets');

DROP POLICY IF EXISTS "Admins can update school assets" ON storage.objects;
CREATE POLICY "Admins can update school assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'school-assets');

DROP POLICY IF EXISTS "Admins can delete school assets" ON storage.objects;
CREATE POLICY "Admins can delete school assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'school-assets');

-- ====================================================================
-- 15. PERMISSIONS GRANTS
-- ====================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
