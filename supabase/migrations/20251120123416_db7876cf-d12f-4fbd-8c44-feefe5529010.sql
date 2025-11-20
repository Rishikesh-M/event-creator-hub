-- Create storage buckets for event images and registration uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('event-banners', 'event-banners', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('registration-uploads', 'registration-uploads', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']);

-- RLS policies for event-banners bucket
CREATE POLICY "Authenticated users can upload event banners"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-banners' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Event banners are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-banners');

CREATE POLICY "Users can update their own event banners"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'event-banners' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own event banners"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-banners' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS policies for registration-uploads bucket (private - only event owners can access)
CREATE POLICY "Anyone can upload registration files"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'registration-uploads');

CREATE POLICY "Event owners can view registration uploads"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'registration-uploads' AND
  EXISTS (
    SELECT 1 FROM events e
    WHERE e.user_id = auth.uid()
    AND e.id::text = (storage.foldername(name))[1]
  )
);

-- Add image_url column to registrations table
ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS image_url text;