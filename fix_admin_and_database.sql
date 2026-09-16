-- ====================================================================
-- KSM COMPLETE DATABASE REPAIR & ADMIN FIX SCRIPT
-- Kindergarten Saadia's Montessori School (Haripur)
-- ====================================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/vulhivjvdeevpkjcibte/sql
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. ADMINS TABLE & SUPER ADMIN USER
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT,
  role TEXT DEFAULT 'super_admin' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Insert admin UID
INSERT INTO public.admins (user_id)
VALUES ('fdda878b-997c-4757-9262-fceaa5616466')
ON CONFLICT (user_id) DO NOTHING;

-- Also insert by email if user signed up with quratulainm244@gmail.com
INSERT INTO public.admins (user_id)
SELECT id FROM auth.users WHERE email = 'quratulainm244@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- Confirm admin email and set password to: KsmAdmin@2026#
UPDATE auth.users
SET 
  encrypted_password = crypt('KsmAdmin@2026#', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  last_sign_in_at = now()
WHERE email = 'quratulainm244@gmail.com' OR id = 'fdda878b-997c-4757-9262-fceaa5616466';

-- 3. HELPER FUNCTION: is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. SITE SETTINGS TABLE (Branding, Contact, Theme, SEO, Sections)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS key TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS value JSONB;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 5. PROGRAMS TABLE (Add all missing columns)
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS number TEXT DEFAULT '01';
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS age_group TEXT;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '🌟';
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 6. GALLERY TABLE (Add all missing columns)
CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Campus Life';
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 7. TESTIMONIALS TABLE (Add all missing columns)
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS relationship TEXT DEFAULT 'KSM Parent';
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS rating INT DEFAULT 5;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 8. TEACHERS TABLE (Add all missing columns)
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 9. NOTICES TABLE (Add all missing columns)
CREATE TABLE IF NOT EXISTS public.notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS badge TEXT DEFAULT 'Announcement';
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 10. EVENTS TABLE (Add all missing columns)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  location TEXT DEFAULT 'KSM Campus',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 11. INQUIRIES TABLE (Add all missing columns)
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_name TEXT,
  status TEXT DEFAULT 'new' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS parent_name TEXT;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS contact_info TEXT;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS child_age TEXT;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- 12. CONTACT MESSAGES TABLE (Add all missing columns)
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'unread';

-- 13. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ====================================================================
-- 14. GRANT PERMISSIONS & REPAIR ROW LEVEL SECURITY (RLS)
-- ====================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Clean existing policies
DROP POLICY IF EXISTS "Public can view admins" ON public.admins;
DROP POLICY IF EXISTS "Admins can manage admins" ON public.admins;
DROP POLICY IF EXISTS "Allow all for admins select" ON public.admins;
CREATE POLICY "Allow all for admins select" ON public.admins FOR SELECT USING (true);
CREATE POLICY "Admins can manage admins" ON public.admins FOR ALL TO authenticated USING (public.is_admin() OR auth.uid() = user_id);

-- Site Settings Policies: anyone can read, authenticated or admin can save
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow all site settings select" ON public.site_settings;
DROP POLICY IF EXISTS "Allow all site settings modify" ON public.site_settings;

CREATE POLICY "Allow all site settings select" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Allow all site settings modify" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

-- Programs Policies
DROP POLICY IF EXISTS "Public can view active programs" ON public.programs;
DROP POLICY IF EXISTS "Admins can manage programs" ON public.programs;
CREATE POLICY "Public can view active programs" ON public.programs FOR SELECT USING (true);
CREATE POLICY "Admins can manage programs" ON public.programs FOR ALL USING (true) WITH CHECK (true);

-- Gallery Policies
DROP POLICY IF EXISTS "Public can view active gallery" ON public.gallery;
DROP POLICY IF EXISTS "Admins can manage gallery" ON public.gallery;
CREATE POLICY "Public can view active gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Admins can manage gallery" ON public.gallery FOR ALL USING (true) WITH CHECK (true);

-- Testimonials Policies
DROP POLICY IF EXISTS "Public can view active testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
CREATE POLICY "Public can view active testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL USING (true) WITH CHECK (true);

-- Teachers Policies
DROP POLICY IF EXISTS "Public can view active teachers" ON public.teachers;
DROP POLICY IF EXISTS "Admins can manage teachers" ON public.teachers;
CREATE POLICY "Public can view active teachers" ON public.teachers FOR SELECT USING (true);
CREATE POLICY "Admins can manage teachers" ON public.teachers FOR ALL USING (true) WITH CHECK (true);

-- Notices Policies
DROP POLICY IF EXISTS "Public can view active notices" ON public.notices;
DROP POLICY IF EXISTS "Admins can manage notices" ON public.notices;
CREATE POLICY "Public can view active notices" ON public.notices FOR SELECT USING (true);
CREATE POLICY "Admins can manage notices" ON public.notices FOR ALL USING (true) WITH CHECK (true);

-- Events Policies
DROP POLICY IF EXISTS "Public can view active events" ON public.events;
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
CREATE POLICY "Public can view active events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (true) WITH CHECK (true);

-- Inquiries Policies
DROP POLICY IF EXISTS "Anyone can submit admission inquiry" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can view inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can update inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can delete inquiries" ON public.inquiries;
CREATE POLICY "Anyone can submit admission inquiry" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view inquiries" ON public.inquiries FOR SELECT USING (true);
CREATE POLICY "Admins can update inquiries" ON public.inquiries FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete inquiries" ON public.inquiries FOR DELETE USING (true);

-- Contact Messages Policies
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view contact messages" ON public.contact_messages FOR SELECT USING (true);
CREATE POLICY "Admins can update contact messages" ON public.contact_messages FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete contact messages" ON public.contact_messages FOR DELETE USING (true);

-- Audit Logs Policies
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs FOR SELECT USING (true);
CREATE POLICY "Admins can insert audit logs" ON public.admin_audit_logs FOR INSERT WITH CHECK (true);

-- Storage bucket for photos and logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('school-assets', 'school-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Access school assets" ON storage.objects;
CREATE POLICY "Public Access school assets" ON storage.objects FOR SELECT USING (bucket_id = 'school-assets');

DROP POLICY IF EXISTS "Admins upload school assets" ON storage.objects;
CREATE POLICY "Admins upload school assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'school-assets');

DROP POLICY IF EXISTS "Admins update school assets" ON storage.objects;
CREATE POLICY "Admins update school assets" ON storage.objects FOR UPDATE USING (bucket_id = 'school-assets');

DROP POLICY IF EXISTS "Admins delete school assets" ON storage.objects;
CREATE POLICY "Admins delete school assets" ON storage.objects FOR DELETE USING (bucket_id = 'school-assets');

-- ====================================================================
-- 15. SEED INITIAL SITE SETTINGS & DEFAULT CONTENT
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
  ('seo', '{
    "metaTitle": "Kindergarten Saadia''s Montessori School | Haripur",
    "metaDescription": "Nurturing Montessori and primary learning environment in Haripur, Khyber Pakhtunkhwa.",
    "keywords": "Montessori school, kindergarten, Haripur, primary school, early childhood education"
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Seed default programs if none exist
INSERT INTO public.programs (number, title, description, age_group, icon, sort_order, is_active)
SELECT '01', 'Early Learning', 'Fun, creative and engaging learning experiences for young children.', '2.5 - 4 Years', '🌱', 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.programs);

INSERT INTO public.programs (number, title, description, age_group, icon, sort_order, is_active)
SELECT '02', 'Primary Education', 'Building strong academic and personal foundations.', '4 - 7 Years', '📚', 2, true
WHERE (SELECT COUNT(*) FROM public.programs) = 1;

INSERT INTO public.programs (number, title, description, age_group, icon, sort_order, is_active)
SELECT '03', 'Student Development', 'Encouraging confidence, creativity and important life skills.', 'All Ages', '🌟', 3, true
WHERE (SELECT COUNT(*) FROM public.programs) = 2;

-- Seed default gallery if none exist
INSERT INTO public.gallery (title, image_url, category, sort_order, is_active)
SELECT 'Learning Together', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80', 'Campus Life', 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.gallery);

INSERT INTO public.gallery (title, image_url, category, sort_order, is_active)
SELECT 'Young Learners', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80', 'Classroom', 2, true
WHERE (SELECT COUNT(*) FROM public.gallery) = 1;

INSERT INTO public.gallery (title, image_url, category, sort_order, is_active)
SELECT 'Creative Activities', 'https://images.unsplash.com/photo-1560785496-3c9d27877182?auto=format&fit=crop&w=900&q=80', 'Activities', 3, true
WHERE (SELECT COUNT(*) FROM public.gallery) = 2;

INSERT INTO public.gallery (title, image_url, category, sort_order, is_active)
SELECT 'Classroom Life', 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=900&q=80', 'Campus Life', 4, true
WHERE (SELECT COUNT(*) FROM public.gallery) = 3;

-- Seed default testimonials if none exist
INSERT INTO public.testimonials (name, relationship, message, rating, sort_order, is_active)
SELECT 'KSM Parent', 'KSM Parent', 'A warm and caring environment where children can learn with confidence.', 5, 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.testimonials);

INSERT INTO public.testimonials (name, relationship, message, rating, sort_order, is_active)
SELECT 'KSM Family', 'KSM Family', 'The focus on early development, activities and individual attention makes learning enjoyable.', 5, 2, true
WHERE (SELECT COUNT(*) FROM public.testimonials) = 1;

INSERT INTO public.testimonials (name, relationship, message, rating, sort_order, is_active)
SELECT 'KSM Parent', 'KSM Parent', 'A positive beginning for a child''s educational journey.', 5, 3, true
WHERE (SELECT COUNT(*) FROM public.testimonials) = 2;
