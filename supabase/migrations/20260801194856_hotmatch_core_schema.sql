/*
# HotMatch Core Schema

## Summary
Creates all core tables for the HotMatch platform and seeds demo data.

## Tables Created
1. `profiles` — user accounts: gender, name, age, bio, location, avatar_url, xp, level, coin_balance, earnings_brl, is_verified
2. `user_photos` — public and VIP photo gallery entries per profile, with coin price for VIP slots
3. `notifications` — in-app notifications (message, match, like types) per user
4. `chat_messages` — private messages with text/audio/locked/gift kinds; is_locked and unlock_price for paid media
5. `reports` — user-submitted abuse reports with subject, description, and status workflow

## Security
- RLS enabled on all tables.
- All policies scoped to `anon, authenticated` with USING/WITH CHECK (true) — this is a no-auth demo
  app where the anon key client owns all data. Intentionally public/shared dataset.

## Notes
- All profile UUIDs are hardcoded for deterministic demo seeding (ON CONFLICT DO NOTHING).
- Photo URLs reference Pexels CDN (license-free stock photography).
*/

-- ───────────────────────────────────────────
-- 1. PROFILES
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  gender       text        NOT NULL CHECK (gender IN ('male','female')),
  name         text        NOT NULL,
  age          integer     NOT NULL,
  bio          text,
  location     text,
  avatar_url   text,
  xp           integer     NOT NULL DEFAULT 0,
  level        text        NOT NULL DEFAULT 'bronze',
  coin_balance integer     NOT NULL DEFAULT 320,
  earnings_brl numeric(10,2) NOT NULL DEFAULT 0,
  is_verified  boolean     NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_profiles"  ON profiles;
DROP POLICY IF EXISTS "anon_insert_profiles"  ON profiles;
DROP POLICY IF EXISTS "anon_update_profiles"  ON profiles;

CREATE POLICY "anon_select_profiles" ON profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_profiles" ON profiles FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_profiles" ON profiles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- ───────────────────────────────────────────
-- 2. USER_PHOTOS
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_photos (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid    NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  photo_url   text    NOT NULL,
  is_vip      boolean NOT NULL DEFAULT false,
  coin_price  integer NOT NULL DEFAULT 0,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_photos_user_id_idx ON user_photos(user_id);

ALTER TABLE user_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_user_photos"  ON user_photos;
DROP POLICY IF EXISTS "anon_insert_user_photos"  ON user_photos;
DROP POLICY IF EXISTS "anon_update_user_photos"  ON user_photos;
DROP POLICY IF EXISTS "anon_delete_user_photos"  ON user_photos;

CREATE POLICY "anon_select_user_photos" ON user_photos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_user_photos" ON user_photos FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_user_photos" ON user_photos FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_user_photos" ON user_photos FOR DELETE TO anon, authenticated USING (true);

-- ───────────────────────────────────────────
-- 3. NOTIFICATIONS
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid    REFERENCES profiles(id) ON DELETE CASCADE,
  type       text    NOT NULL CHECK (type IN ('message','match','like')),
  title      text    NOT NULL,
  content    text,
  is_read    boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_notifications"  ON notifications;
DROP POLICY IF EXISTS "anon_insert_notifications"  ON notifications;
DROP POLICY IF EXISTS "anon_update_notifications"  ON notifications;

CREATE POLICY "anon_select_notifications" ON notifications FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_notifications" ON notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_notifications" ON notifications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- ───────────────────────────────────────────
-- 4. CHAT_MESSAGES
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id            uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id     uuid    REFERENCES profiles(id) ON DELETE SET NULL,
  receiver_id   uuid    REFERENCES profiles(id) ON DELETE SET NULL,
  content       text,
  media_url     text,
  is_locked     boolean NOT NULL DEFAULT false,
  unlock_price  integer NOT NULL DEFAULT 0,
  message_kind  text    NOT NULL DEFAULT 'text' CHECK (message_kind IN ('text','audio','locked','gift')),
  audio_seconds integer,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_messages_pair_idx
  ON chat_messages (
    LEAST(sender_id::text, receiver_id::text),
    GREATEST(sender_id::text, receiver_id::text),
    created_at
  );

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_chat_messages"  ON chat_messages;
DROP POLICY IF EXISTS "anon_insert_chat_messages"  ON chat_messages;

CREATE POLICY "anon_select_chat_messages" ON chat_messages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_chat_messages" ON chat_messages FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ───────────────────────────────────────────
-- 5. REPORTS
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id               uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id      uuid    REFERENCES profiles(id) ON DELETE SET NULL,
  reported_user_id uuid    REFERENCES profiles(id) ON DELETE SET NULL,
  subject          text    NOT NULL,
  description      text,
  status           text    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewed','resolved')),
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_reports"  ON reports;
DROP POLICY IF EXISTS "anon_insert_reports"  ON reports;

CREATE POLICY "anon_select_reports" ON reports FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_reports" ON reports FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ───────────────────────────────────────────
-- 6. SEED — PROFILES (deterministic UUIDs)
-- ───────────────────────────────────────────
INSERT INTO profiles (id, gender, name, age, bio, location, avatar_url, xp, level, coin_balance, earnings_brl, is_verified) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'female', 'Bianca', 25,
  'Amo noites de neon, drinks e boas conversas. Criadora de conteúdo exclusivo 🔥',
  'São Paulo, SP',
  'https://images.pexels.com/photos/15719223/pexels-photo-15719223.jpeg?auto=compress&cs=tinysrgb&w=600',
  7200, 'ouro', 0, 2480.50, true
),
(
  '00000000-0000-0000-0000-000000000002',
  'male', 'Carlos', 28,
  'Apaixonado por música, viagens e boa conversa.',
  'São Paulo, SP',
  'https://images.pexels.com/photos/1066109/pexels-photo-1066109.jpeg?auto=compress&cs=tinysrgb&w=600',
  1200, 'prata', 320, 0, false
),
(
  '00000000-0000-0000-0000-000000000003',
  'female', 'Marina', 23,
  'Cachos, café e pôr do sol na cobertura. Vem trocar ideia.',
  'Rio de Janeiro, RJ',
  'https://images.pexels.com/photos/33949302/pexels-photo-33949302.jpeg?auto=compress&cs=tinysrgb&w=600',
  3400, 'prata', 0, 890.00, true
),
(
  '00000000-0000-0000-0000-000000000004',
  'female', 'Helena', 27,
  'Elegância é atitude. Lounge, jazz e conteúdo VIP toda semana.',
  'Belo Horizonte, MG',
  'https://images.pexels.com/photos/7304337/pexels-photo-7304337.jpeg?auto=compress&cs=tinysrgb&w=600',
  8900, 'ouro', 0, 4120.00, true
),
(
  '00000000-0000-0000-0000-000000000005',
  'female', 'Duda', 24,
  'Praia, treino e risada fácil. Bora tomar um açaí?',
  'Florianópolis, SC',
  'https://images.pexels.com/photos/16974331/pexels-photo-16974331.jpeg?auto=compress&cs=tinysrgb&w=600',
  1800, 'bronze', 0, 0, false
)
ON CONFLICT (id) DO NOTHING;

-- ───────────────────────────────────────────
-- 7. SEED — USER_PHOTOS
-- ───────────────────────────────────────────
INSERT INTO user_photos (user_id, photo_url, is_vip, coin_price, sort_order) VALUES
-- Bianca public
('00000000-0000-0000-0000-000000000001','https://images.pexels.com/photos/15719223/pexels-photo-15719223.jpeg?auto=compress&cs=tinysrgb&w=600',false,0,1),
('00000000-0000-0000-0000-000000000001','https://images.pexels.com/photos/20459105/pexels-photo-20459105.jpeg?auto=compress&cs=tinysrgb&w=600',false,0,2),
('00000000-0000-0000-0000-000000000001','https://images.pexels.com/photos/1066109/pexels-photo-1066109.jpeg?auto=compress&cs=tinysrgb&w=600',false,0,3),
-- Bianca VIP
('00000000-0000-0000-0000-000000000001','https://images.pexels.com/photos/33949302/pexels-photo-33949302.jpeg?auto=compress&cs=tinysrgb&w=600',true,45,1),
('00000000-0000-0000-0000-000000000001','https://images.pexels.com/photos/7304337/pexels-photo-7304337.jpeg?auto=compress&cs=tinysrgb&w=600',true,60,2),
('00000000-0000-0000-0000-000000000001','https://images.pexels.com/photos/16974331/pexels-photo-16974331.jpeg?auto=compress&cs=tinysrgb&w=600',true,90,3),
('00000000-0000-0000-0000-000000000001','https://images.pexels.com/photos/15719223/pexels-photo-15719223.jpeg?auto=compress&cs=tinysrgb&w=600',true,120,4),
('00000000-0000-0000-0000-000000000001','https://images.pexels.com/photos/20459105/pexels-photo-20459105.jpeg?auto=compress&cs=tinysrgb&w=600',true,150,5),
('00000000-0000-0000-0000-000000000001','https://images.pexels.com/photos/1066109/pexels-photo-1066109.jpeg?auto=compress&cs=tinysrgb&w=600',true,200,6),
-- Helena public + VIP
('00000000-0000-0000-0000-000000000004','https://images.pexels.com/photos/7304337/pexels-photo-7304337.jpeg?auto=compress&cs=tinysrgb&w=600',false,0,1),
('00000000-0000-0000-0000-000000000004','https://images.pexels.com/photos/16974331/pexels-photo-16974331.jpeg?auto=compress&cs=tinysrgb&w=600',false,0,2),
('00000000-0000-0000-0000-000000000004','https://images.pexels.com/photos/20459105/pexels-photo-20459105.jpeg?auto=compress&cs=tinysrgb&w=600',false,0,3),
('00000000-0000-0000-0000-000000000004','https://images.pexels.com/photos/33949302/pexels-photo-33949302.jpeg?auto=compress&cs=tinysrgb&w=600',true,60,1),
('00000000-0000-0000-0000-000000000004','https://images.pexels.com/photos/15719223/pexels-photo-15719223.jpeg?auto=compress&cs=tinysrgb&w=600',true,90,2),
('00000000-0000-0000-0000-000000000004','https://images.pexels.com/photos/1066109/pexels-photo-1066109.jpeg?auto=compress&cs=tinysrgb&w=600',true,150,3)
ON CONFLICT DO NOTHING;

-- ───────────────────────────────────────────
-- 8. SEED — NOTIFICATIONS (for demo users)
-- ───────────────────────────────────────────
INSERT INTO notifications (id, user_id, type, title, content, is_read, created_at) VALUES
-- For Carlos (male demo)
('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','message','Bianca enviou uma mensagem','Te mandei uma mídia privada 😏',false, now() - interval '5 minutes'),
('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','match','Novo match com Helena!','Você e Helena se curtiram mutuamente.',false, now() - interval '1 hour'),
('10000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000002','like','Marina curtiu seu perfil','Alguém está interessada em você!',false, now() - interval '2 hours'),
('10000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000002','message','Helena enviou uma mensagem','Adorei o mimo, obrigada!',true,  now() - interval '1 day'),
-- For Bianca (female demo)
('10000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000001','message','Carlos enviou uma mensagem','Curti muito seu perfil!',false, now() - interval '10 minutes'),
('10000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000001','match','Novo match com Carlos!','Carlos curtiu seu perfil também.',false, now() - interval '3 hours'),
('10000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000001','like','3 pessoas curtiram seu perfil','Você está em alta hoje 🔥',true,  now() - interval '2 days')
ON CONFLICT (id) DO NOTHING;

-- ───────────────────────────────────────────
-- 9. SEED — CHAT_MESSAGES (Bianca ↔ Carlos)
-- ───────────────────────────────────────────
INSERT INTO chat_messages (id, sender_id, receiver_id, content, message_kind, is_locked, unlock_price, created_at) VALUES
('20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','Oiê, curti muito seu perfil 😍','text',false,0, now() - interval '40 minutes'),
('20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','Também curti o seu! Tudo bem?','text',false,0, now() - interval '38 minutes'),
('20000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','Te mandei uma mídia privada 😏','locked',true,45, now() - interval '18 minutes')
ON CONFLICT (id) DO NOTHING;
