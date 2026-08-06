/*
# Add actor fields to notifications + create follows table

## Changes

### Modified Tables
- `notifications`: added `actor_id` (uuid, nullable FK to profiles) and `actor_avatar_url` (text, nullable).
  These fields let like notifications carry the liker's identity so the UI can show a blurred avatar
  with an unlock CTA for male recipients.

### New Tables
- `follows`: records who is following which creator profile.
  - `follower_id` – the user who pressed "Seguir"
  - `following_id` – the creator being followed
  - UNIQUE(follower_id, following_id) — one row per pair
  Used when a creator publishes a new post: the app queries this table to find all
  followers and inserts in-app notifications + fires push notifications to each.

## Security
- RLS enabled on `follows`.
- Four separate policies (SELECT / INSERT / UPDATE / DELETE) scoped to `anon, authenticated`
  because the app authenticates via the anon key without Supabase Auth sessions.
*/

-- ── notifications: add actor columns ──────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'actor_id'
  ) THEN
    ALTER TABLE notifications ADD COLUMN actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'actor_avatar_url'
  ) THEN
    ALTER TABLE notifications ADD COLUMN actor_avatar_url text;
  END IF;
END $$;

-- ── follows ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS follows (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id  uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "follows_select" ON follows;
CREATE POLICY "follows_select" ON follows FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "follows_insert" ON follows;
CREATE POLICY "follows_insert" ON follows FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "follows_update" ON follows;
CREATE POLICY "follows_update" ON follows FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "follows_delete" ON follows;
CREATE POLICY "follows_delete" ON follows FOR DELETE
  TO anon, authenticated USING (true);
