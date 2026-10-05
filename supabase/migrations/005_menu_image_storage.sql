-- SmartQR — Menu Product Images Storage Setup
-- Migration: 005_menu_image_storage.sql

-- Create the storage bucket for menu images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'menu-images'
);

-- Allow business members to update their own business images
CREATE POLICY "Allow business members to update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'menu-images'
);

-- Allow authenticated users to delete their own business images
CREATE POLICY "Allow business members to delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'menu-images'
);

-- Allow public to view menu images
CREATE POLICY "Allow public to view menu images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'menu-images');
