/*
# Create chat-media storage bucket

1. New Storage Bucket
- `chat-media` (public) — stores audio clips and media shared in chat messages.
2. Security
- Public read (SELECT) for anyone.
- anon + authenticated can INSERT, UPDATE, DELETE objects in this bucket.
- Follows the same pattern as the existing `photos` and `avatars` buckets.
*/

INSERT INTO storage.buckets (id, name, public)
  VALUES ('chat-media', 'chat-media', true)
  ON CONFLICT (id) DO NOTHING;

-- ── chat-media ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "chat_media_public_read" ON storage.objects;
CREATE POLICY "chat_media_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'chat-media');

DROP POLICY IF EXISTS "chat_media_anon_insert" ON storage.objects;
CREATE POLICY "chat_media_anon_insert" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'chat-media');

DROP POLICY IF EXISTS "chat_media_anon_update" ON storage.objects;
CREATE POLICY "chat_media_anon_update" ON storage.objects
  FOR UPDATE TO anon, authenticated USING (bucket_id = 'chat-media');

DROP POLICY IF EXISTS "chat_media_anon_delete" ON storage.objects;
CREATE POLICY "chat_media_anon_delete" ON storage.objects
  FOR DELETE TO anon, authenticated USING (bucket_id = 'chat-media');
