-- SmartQR — Video Menu Storage Setup
-- Migration: 009_video_menu_storage.sql
-- Adds video_url column to menu_products and creates menu-media storage bucket.

-- =============================================
-- DATABASE: Add video_url column
-- =============================================

ALTER TABLE public.menu_products
  ADD COLUMN IF NOT EXISTS video_url TEXT;

-- =============================================
-- STORAGE: Create menu-media bucket
-- =============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-media', 'menu-media', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- STORAGE POLICIES: menu-media
-- Consistent with existing storage policies (migrations 005 & 006)
-- =============================================

-- Public READ
CREATE POLICY "Public can view menu media"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'menu-media');

-- Authenticated INSERT
CREATE POLICY "Members can upload menu videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'menu-media');

-- Authenticated UPDATE
CREATE POLICY "Members can update menu videos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'menu-media')
  WITH CHECK (bucket_id = 'menu-media');

-- Authenticated DELETE
CREATE POLICY "Members can delete menu videos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'menu-media');
