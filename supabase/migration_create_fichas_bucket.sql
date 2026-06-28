-- Create storage bucket for technical datasheets (fichas técnicas)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('fichas-tecnicas', 'fichas-tecnicas', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated Upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'fichas-tecnicas' 
    AND auth.role() = 'authenticated'
  );

-- Allow users to delete their own uploads
CREATE POLICY "Own Delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'fichas-tecnicas' 
    AND auth.uid() = owner
  );
