/*
# Likes table + Mutual Matches table

## Purpose
Split swipe tracking into two purpose-built tables so mutual-match detection
is a simple DB lookup rather than a dual cross-query on a shared table.

## New Tables

### `likes`
Stores every one-directional "like" action.
- `id`             – UUID primary key
- `user_id`        – the profile that pressed Amei
- `target_user_id` – the profile that was liked
- UNIQUE(user_id, target_user_id) — one like per pair direction

### `mutual_matches`
Written exactly once when BOTH sides have liked each other.
- `id`       – UUID primary key
- `user1_id` – the lower UUID of the pair (always sorted ascending at insert time)
- `user2_id` – the higher UUID of the pair
- UNIQUE(user1_id, user2_id) — one row per couple, regardless of who liked first
- `created_at` – when the match was confirmed

## Security
Both tables use RLS with USING (true) / WITH CHECK (true) for anon + authenticated
because the app authenticates with the anon key (no Supabase Auth session).
Existing `matches` table is left untouched — it continues to serve as the
swipe-history source that excludes already-seen profiles from the feed.
*/

-- ── likes ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS likes (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_user_id uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_user_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "likes_select" ON likes;
CREATE POLICY "likes_select" ON likes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "likes_insert" ON likes;
CREATE POLICY "likes_insert" ON likes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "likes_update" ON likes;
CREATE POLICY "likes_update" ON likes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ── mutual_matches ─────────────────────────────────────────────────────────────
-- user1_id is always the lexicographically smaller UUID; user2_id the larger.
-- The application sorts the pair before every insert/query to guarantee a single
-- canonical row per couple.
CREATE TABLE IF NOT EXISTS mutual_matches (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id   uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id   uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user1_id, user2_id)
);

ALTER TABLE mutual_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mutual_matches_select" ON mutual_matches;
CREATE POLICY "mutual_matches_select" ON mutual_matches FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "mutual_matches_insert" ON mutual_matches;
CREATE POLICY "mutual_matches_insert" ON mutual_matches FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "mutual_matches_update" ON mutual_matches;
CREATE POLICY "mutual_matches_update" ON mutual_matches FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
