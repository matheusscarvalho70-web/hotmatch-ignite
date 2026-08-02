-- Create dedicated buckets for avatar images and user gallery photos.
-- Follows the same public-read / anon+authenticated-write pattern as the existing 'photos' bucket.

INSERT INTO storage.buckets (id, name, public)
  VALUES
    ('avatars',     'avatars',     true),
    ('user_photos', 'user_photos', true)
  ON CONFLICT (id) DO NOTHING;

-- ── avatars ────────────────────────────────────────────────────────────
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_anon_insert" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars_anon_update" ON storage.objects
  FOR UPDATE TO anon, authenticated USING (bucket_id = 'avatars');

-- ── user_photos ────────────────────────────────────────────────────────
CREATE POLICY "user_photos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'user_photos');

CREATE POLICY "user_photos_anon_insert" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'user_photos');

CREATE POLICY "user_photos_anon_update" ON storage.objects
  FOR UPDATE TO anon, authenticated USING (bucket_id = 'user_photos');

CREATE POLICY "user_photos_anon_delete" ON storage.objects
  FOR DELETE TO anon, authenticated USING (bucket_id = 'user_photos');
