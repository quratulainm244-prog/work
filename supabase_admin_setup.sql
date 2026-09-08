-- ====================================================================
-- Complete Supabase Database Setup & RLS Migration for KSM Admin Panel
-- Kindergarten Saadia's Montessori School (Haripur)
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 2. ADMINS TABLE (Authorized Administrators by auth.users UID)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT,
  role TEXT DEFAULT 'super_admin' NOT NULL, -- 'super_admin', 'editor'
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- --------------------------------------------------------------------
-- 3. ADMIN AUDIT LOGS (Tracks admin activity and modifications)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email TEXT,
  action TEXT NOT NULL,       -- e.g. 'update_logo', 'delete_gallery_image'
  entity TEXT NOT NULL,       -- e.g. 'site_settings', 'gallery', 'admissions'
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- --------------------------------------------------------------------
-- 4. SITE SETTINGS (Dynamic Branding, Theme, Social, SEO, Layout)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- --------------------------------------------------------------------
-- 5. ADMISSIONS / INQUIRIES (Student Admission Applications)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_name TEXT NOT NULL,
  contact_info TEXT NOT NULL,
  child_name TEXT,
  child_age TEXT,
  message TEXT,
  status TEXT DEFAULT 'new' NOT NULL, -- 'new', 'reviewed', 'contacted', 'enrolled', 'archived'
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- --------------------------------------------------------------------
-- 6. CONTACT MESSAGES (General Inquiries from Parents & Visitors)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' NOT NULL, -- 'unread', 'read', 'archived'
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- --------------------------------------------------------------------
-- 7. GALLERY (Photos of Activities, Events, Classrooms)
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

-- --------------------------------------------------------------------
-- 8. PROGRAMS / CLASSES (Montessori Stages & Curriculum)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number TEXT NOT NULL,          -- e.g. '01', '02', '03'
  title TEXT NOT NULL,           -- e.g. 'Early Learning'
  description TEXT NOT NULL,
  age_group TEXT,                -- e.g. '2.5 - 4 Years'
  icon TEXT DEFAULT '🌟',
  sort_order INT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- --------------------------------------------------------------------
-- 9. TEACHERS & STAFF (School Educators)
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

-- --------------------------------------------------------------------
-- 10. TESTIMONIALS (Reviews from Parents)
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

-- --------------------------------------------------------------------
-- 11. NOTICES & ANNOUNCEMENTS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  badge TEXT DEFAULT 'Announcement', -- 'Important', 'Holiday', 'Admission', etc.
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- --------------------------------------------------------------------
-- 12. EVENTS & CALENDAR
-- --------------------------------------------------------------------
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
-- 13. HELPER FUNCTION FOR ADMIN AUTHORIZATION (SECURITY DEFINER)
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
-- 14. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ====================================================================
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- 15. ROW LEVEL SECURITY POLICIES
-- ====================================================================

-- --- ADMINS POLICIES ---
DROP POLICY IF EXISTS "Admins can view admins" ON public.admins;
CREATE POLICY "Admins can view admins"
  ON public.admins FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage admins" ON public.admins;
CREATE POLICY "Admins can manage admins"
  ON public.admins FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- --- AUDIT LOGS POLICIES ---
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can insert audit logs"
  ON public.admin_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- --- SITE SETTINGS POLICIES (Public read, Admin manage) ---
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

-- --- INQUIRIES / ADMISSIONS POLICIES (Public insert, Admin manage) ---
DROP POLICY IF EXISTS "Anyone can submit admission inquiry" ON public.inquiries;
CREATE POLICY "Anyone can submit admission inquiry"
  ON public.inquiries FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view inquiries" ON public.inquiries;
CREATE POLICY "Admins can view inquiries"
  ON public.inquiries FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update inquiries" ON public.inquiries;
CREATE POLICY "Admins can update inquiries"
  ON public.inquiries FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete inquiries" ON public.inquiries;
CREATE POLICY "Admins can delete inquiries"
  ON public.inquiries FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- --- CONTACT MESSAGES POLICIES (Public insert, Admin manage) ---
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;
CREATE POLICY "Admins can view contact messages"
  ON public.contact_messages FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;
CREATE POLICY "Admins can update contact messages"
  ON public.contact_messages FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_messages;
CREATE POLICY "Admins can delete contact messages"
  ON public.contact_messages FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- --- PUBLIC CONTENT POLICIES (Gallery, Programs, Teachers, Testimonials, Notices, Events) ---
-- Public can view active items, Admins have full access

-- Gallery
DROP POLICY IF EXISTS "Public can view active gallery" ON public.gallery;
CREATE POLICY "Public can view active gallery"
  ON public.gallery FOR SELECT
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage gallery" ON public.gallery;
CREATE POLICY "Admins can manage gallery"
  ON public.gallery FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Programs
DROP POLICY IF EXISTS "Public can view active programs" ON public.programs;
CREATE POLICY "Public can view active programs"
  ON public.programs FOR SELECT
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage programs" ON public.programs;
CREATE POLICY "Admins can manage programs"
  ON public.programs FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Teachers
DROP POLICY IF EXISTS "Public can view active teachers" ON public.teachers;
CREATE POLICY "Public can view active teachers"
  ON public.teachers FOR SELECT
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage teachers" ON public.teachers;
CREATE POLICY "Admins can manage teachers"
  ON public.teachers FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Testimonials
DROP POLICY IF EXISTS "Public can view active testimonials" ON public.testimonials;
CREATE POLICY "Public can view active testimonials"
  ON public.testimonials FOR SELECT
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
CREATE POLICY "Admins can manage testimonials"
  ON public.testimonials FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Notices
DROP POLICY IF EXISTS "Public can view active notices" ON public.notices;
CREATE POLICY "Public can view active notices"
  ON public.notices FOR SELECT
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage notices" ON public.notices;
CREATE POLICY "Admins can manage notices"
  ON public.notices FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Events
DROP POLICY IF EXISTS "Public can view active events" ON public.events;
CREATE POLICY "Public can view active events"
  ON public.events FOR SELECT
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
CREATE POLICY "Admins can manage events"
  ON public.events FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ====================================================================
-- 16. STORAGE BUCKET & STORAGE RLS POLICIES
-- ====================================================================
-- Create public bucket 'school-assets' for images if not already created
INSERT INTO storage.buckets (id, name, public)
VALUES ('school-assets', 'school-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS: Public can view images
DROP POLICY IF EXISTS "Public can view school assets" ON storage.objects;
CREATE POLICY "Public can view school assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'school-assets');

-- Storage RLS: Admins can upload images
DROP POLICY IF EXISTS "Admins can upload school assets" ON storage.objects;
CREATE POLICY "Admins can upload school assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'school-assets' AND public.is_admin());

-- Storage RLS: Admins can update images
DROP POLICY IF EXISTS "Admins can update school assets" ON storage.objects;
CREATE POLICY "Admins can update school assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'school-assets' AND public.is_admin());

-- Storage RLS: Admins can delete images
DROP POLICY IF EXISTS "Admins can delete school assets" ON storage.objects;
CREATE POLICY "Admins can delete school assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'school-assets' AND public.is_admin());

-- ====================================================================
-- 17. INITIAL SEED DATA FOR SITE SETTINGS
-- ====================================================================
INSERT INTO public.site_settings (key, value)
VALUES
  ('branding', '{
    "schoolName": "KINDERGARTEN SAADIA''S",
    "fullName": "Kindergarten Saadia''s Montessori School",
    "tagline": "Learn • Grow • Succeed",
    "logoUrl": "",
    "mascotName": "KSM Mascot"
  }'::jsonb),
  ('theme', '{
    "primaryColor": "#123f62",
    "secondaryColor": "#efa91f",
    "accentColor": "#0a1d30",
    "backgroundColor": "#ffffff",
    "fontHeading": "Spline Sans",
    "fontBody": "Inter",
    "buttonRadius": 8
  }'::jsonb),
  ('sections', '{
    "hero": true,
    "features": true,
    "about": true,
    "programs": true,
    "why": true,
    "activities": true,
    "gallery": true,
    "testimonials": true,
    "admissions": true,
    "contact": true
  }'::jsonb),
  ('contact', '{
    "location": "Haripur, Khyber Pakhtunkhwa, Pakistan",
    "level": "Primary / Montessori education",
    "facebookName": "Kindergarten Saadia''s Montessori School",
    "facebookUrl": "https://www.facebook.com/Kindergarten786/",
    "instagramUrl": "",
    "whatsappNumber": "+923000000000",
    "email": "info@ksmschool.edu.pk",
    "phone": "+92 995 000000"
  }'::jsonb),
  ('seo', '{
    "metaTitle": "Kindergarten Saadia''s Montessori School | Haripur",
    "metaDescription": "Nurturing Montessori and primary learning environment in Haripur, Khyber Pakhtunkhwa.",
    "keywords": "Montessori school, kindergarten, Haripur, primary school, early childhood education"
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ====================================================================
-- 18. INITIAL SUPER ADMIN ASSIGNMENT
-- ====================================================================
INSERT INTO public.admins (user_id, email, role, is_active)
VALUES ('fdda878b-997c-4757-9262-fceaa5616466', 'quratulainm244@gmail.com', 'super_admin', true)
ON CONFLICT (user_id) DO UPDATE
SET role = 'super_admin', email = 'quratulainm244@gmail.com', is_active = true;

