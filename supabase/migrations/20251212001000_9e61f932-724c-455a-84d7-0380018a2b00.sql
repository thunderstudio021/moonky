-- Storage policies for brand-logos bucket
CREATE POLICY "Admins can upload brand logos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'brand-logos' 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can update brand logos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'brand-logos' 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete brand logos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'brand-logos' 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Brand logos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'brand-logos');