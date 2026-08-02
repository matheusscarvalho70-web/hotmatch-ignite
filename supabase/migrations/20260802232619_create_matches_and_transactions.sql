-- ── matches ──────────────────────────────────────────────────────────────────
-- Records a swipe action (like / pass) between two profiles.
-- UNIQUE on (user_id, target_user_id) so a user can only have one decision per target;
-- use upsert with onConflict to update if they swipe again.

CREATE TABLE IF NOT EXISTS matches (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_user_id uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action         text        NOT NULL CHECK (action IN ('like', 'pass')),
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_user_id)
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_matches" ON matches FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_matches" ON matches FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_matches" ON matches FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ── transactions ───────────────────────────────────────────────────────────────
-- Records every coin / money movement: purchases, gifts sent/received, unlocks,
-- withdrawals, etc.

CREATE TABLE IF NOT EXISTS transactions (
  id           uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount       numeric(10,2) NOT NULL DEFAULT 0,   -- BRL value
  coins_amount integer       NOT NULL DEFAULT 0,   -- coin delta
  type         text          NOT NULL,              -- 'purchase' | 'gift_sent' | 'gift_received' | 'unlock' | 'withdrawal'
  created_at   timestamptz   NOT NULL DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_transactions" ON transactions FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_transactions" ON transactions FOR INSERT
  TO anon, authenticated WITH CHECK (true);
