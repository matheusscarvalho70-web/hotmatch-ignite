/*
# Add payment status, provider fields to transactions + VIP fields to profiles

## Summary
Prepares the database for Mercado Pago integration:
1. `transactions` gets `status`, `provider`, `provider_payment_id`, and `metadata`
   columns so we can track a payment from "pending" through "approved".
2. `profiles` gets `is_vip` and `vip_expires_at` columns so the webhook can
   activate the VIP Gold subscription and record its expiry.

## Modified Tables
- `transactions`
  - `status text NOT NULL DEFAULT 'pending'` — pending | approved | cancelled | failed
  - `provider text` — e.g. 'mercadopago'
  - `provider_payment_id text` — Mercado Pago payment ID
  - `metadata jsonb` — arbitrary extra data (preference ID, pack id, etc.)
- `profiles`
  - `is_vip boolean NOT NULL DEFAULT false`
  - `vip_expires_at timestamptz` — when the VIP subscription ends (NULL = no VIP)

## Security
No new tables; existing RLS policies on `transactions` and `profiles` already
allow anon+authenticated CRUD (no-auth demo app pattern). No policy changes
needed.

## Notes
1. All additions use `IF NOT EXISTS` guards so re-running is safe.
2. `status` CHECK constraint allows: pending, approved, cancelled, failed.
3. Existing rows default to `status = 'pending'` which is harmless for past
   coin-only operations.
*/

DO $$
BEGIN
  -- transactions new columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'status'
  ) THEN
    ALTER TABLE transactions ADD COLUMN status text NOT NULL DEFAULT 'pending';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'provider'
  ) THEN
    ALTER TABLE transactions ADD COLUMN provider text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'provider_payment_id'
  ) THEN
    ALTER TABLE transactions ADD COLUMN provider_payment_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE transactions ADD COLUMN metadata jsonb;
  END IF;

  -- profiles VIP columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_vip'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_vip boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'vip_expires_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN vip_expires_at timestamptz;
  END IF;
END $$;

-- Add CHECK on status (idempotent-ish: drop + recreate)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'transactions_status_check'
  ) THEN
    ALTER TABLE transactions
      ADD CONSTRAINT transactions_status_check
      CHECK (status IN ('pending','approved','cancelled','failed'));
  END IF;
END $$;
