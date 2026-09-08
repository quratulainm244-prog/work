-- ===================================================
-- Supabase Table Setup for Kindergarten Saadia's Website
-- Copy & Run this script in your Supabase SQL Editor
-- (https://supabase.com/dashboard/project/vulhivjvdeevpkjcibte/sql)
-- ===================================================

-- 1. Create the inquiries table
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_name TEXT NOT NULL,
  contact_info TEXT NOT NULL,
  child_name TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 3. Create policy to allow anonymous website visitors to submit inquiries
CREATE POLICY "Allow public insert to inquiries"
  ON public.inquiries
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 4. Create policy to allow reading inquiries (for authenticated admin / owner)
CREATE POLICY "Allow authenticated read inquiries"
  ON public.inquiries
  FOR SELECT
  TO authenticated
  USING (true);
