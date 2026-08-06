/*
# VIP Gallery Unlocks + profile photo arrays + vip-photos bucket

## Summary
This migration supports the mandatory coin-based VIP gallery unlock feature.
Creators can store up to 6 VIP photos; visitors (male users) must spend coins
to unlock a creator's entire VIP gallery. VIP members get a discount but still
pay. The unlock is per (visitor, creator) pair and permanent.

## Modified Tables
- `profiles`:
  - `public_photos text[]` — array of public photo URLs (up to 3).
  - `vip_photos text[]` — array of VIP photo URLs (up to 6), shown blurred
    until a visitor pays to unlock.

## New Tables
- `vip_gallery_unlocks`:
  - `visitor_id` — the male user who paid.
  - `creator_id` — the female creator whose gallery was unlocked.
  - `coins_paid` — how many coins were debited.
  - UNIQUE(visitor_id, creator_id) — one unlock per pair, permanent.

## Storage
- Creates `vip-photos` bucket (public read, anon+authenticated write).

## Security
- RLS enabled on `vip_gallery_unlocks` with full anon/authenticated CRUD
  (no-auth demo app pattern, consistent with all other tables).
*/

-- ── profiles: add photo arrays ────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'public_photos'
  ) THEN
    ALTER TABLE profiles ADD COLUMN public_photos text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'vip_photos'
  ) THEN
    ALTER TABLE profiles ADD COLUMN vip_photos text[] DEFAULT '{}';
  END IF;
END $$;

-- ── vip-photos bucket ────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
  VALUES ('vip-photos', 'vip-photos', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "vip_photos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'vip-photos');

CREATE POLICY "vip_photos_anon_insert" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'vip-photos');

CREATE POLICY "vip_photos_anon_update" ON storage.objects
  FOR UPDATE TO anon, authenticated USING (bucket_id = 'vip-photos');

CREATE POLICY "vip_photos_anon_delete" ON storage.objects
  FOR DELETE TO anon, authenticated USING (bucket_id = 'vip-photos');

-- ── vip_gallery_unlocks ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vip_gallery_unlocks (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id  uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  creator_id  uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coins_paid  integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (visitor_id, creator_id)
);

ALTER TABLE vip_gallery_unlocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vip_gallery_unlocks_select" ON vip_gallery_unlocks;
CREATE POLICY "vip_gallery_unlocks_select" ON vip_gallery_unlocks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "vip_gallery_unlocks_insert" ON vip_gallery_unlocks;
CREATE POLICY "vip_gallery_unlocks_insert" ON vip_gallery_unlocks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "vip_gallery_unlocks_update" ON vip_gallery_unlocks;
CREATE POLICY "vip_gallery_unlocks_update" ON vip_gallery_unlocks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "vip_gallery_unlocks_delete" ON vip_gallery_unlocks;
CREATE POLICY "vip_gallery_unlocks_delete" ON vip_gallery_unlocks FOR DELETE
  TO anon, authenticated USING (true);
