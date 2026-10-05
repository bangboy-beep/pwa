-- SmartQR — Business Images Storage Setup (Banner & Logo)
-- Migration: 006_business_image_storage.sql

-- Create the storage bucket for business images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-images', 'business-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload business images
CREATE POLICY "Allow authenticated business image uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'business-images'
);

-- Allow business members to update their own business images
CREATE POLICY "Allow business members to update business images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'business-images'
);

-- Allow business members to delete their own business images
CREATE POLICY "Allow business members to delete business images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'business-images'
);

-- Allow public to view business images
CREATE POLICY "Allow public to view business images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'business-images');
