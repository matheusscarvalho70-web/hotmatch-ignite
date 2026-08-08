/*
# Add gallery_price column to profiles

## Summary
Adds a `gallery_price` column to the `profiles` table so each creator can
define the coin price visitors pay to unlock her VIP gallery.  This replaces
the previous hard-coded flat fee and makes the price per-creator as required
by the updated financial rules.

## Modified Tables
- `profiles`
  - `gallery_price integer NOT NULL DEFAULT 15` — coin amount a visitor
    (male or female) must pay to unlock that creator's VIP gallery.

## Notes
1. The default of 15 preserves the previous behaviour for existing rows.
2. No RLS changes needed — `profiles` already has full CRUD policies.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'gallery_price'
  ) THEN
    ALTER TABLE profiles ADD COLUMN gallery_price integer NOT NULL DEFAULT 15;
  END IF;
END $$;
