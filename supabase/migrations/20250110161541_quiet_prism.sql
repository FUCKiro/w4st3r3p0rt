/*
  # Add photo support to waste reports

  1. Changes
    - Add photos column to waste_reports table to store photo URLs
    - Create storage bucket for report photos
    - Set up storage policies for authenticated users

  2. Security
    - Enable public read access to photos
    - Restrict upload permissions to authenticated users
*/

-- Add photos column to waste_reports
ALTER TABLE waste_reports
ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}';

-- Create storage bucket for report photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-photos', 'report-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to photos
CREATE POLICY "Public can view report photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'report-photos');

-- Allow authenticated users to upload photos
CREATE POLICY "Users can upload report photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'report-photos'
);

-- Allow users to delete their own photos
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'report-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);