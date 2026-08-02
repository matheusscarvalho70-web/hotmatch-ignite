/*
# Add verification fields to profiles

1. Modified Tables
   - `profiles`
     - Added `verification_status text` – tracks the lifecycle of the biometric
       check: 'unverified' (default, never submitted), 'pending' (selfie uploaded,
       awaiting manual/AI review), 'verified' (approved), 'rejected' (failed).
     - Added `verification_photo_url text` – public URL of the selfie uploaded
       during onboarding, stored in the `photos` storage bucket under the
       `verifications/` path prefix.

2. Notes
   - Both columns use `IF NOT EXISTS` guards so the migration is safe to re-run.
   - No existing data is altered; existing rows default to 'unverified'.
   - Coin balance default corrected to 0 for new rows.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE profiles
      ADD COLUMN verification_status text
        NOT NULL DEFAULT 'unverified'
        CHECK (verification_status IN ('unverified','pending','verified','rejected'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'verification_photo_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN verification_photo_url text;
  END IF;
END $$;

ALTER TABLE profiles ALTER COLUMN coin_balance SET DEFAULT 0;
