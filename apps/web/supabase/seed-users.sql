-- =====================
-- SEED USERS + ADMIN
-- Run in Supabase SQL Editor
-- =====================

-- Create auth users (only if they don't exist)
DO $$
DECLARE
  u1 uuid := gen_random_uuid();
  u2 uuid := gen_random_uuid();
  u3 uuid := gen_random_uuid();
  u4 uuid := gen_random_uuid();
  u5 uuid := gen_random_uuid();
  ua uuid := gen_random_uuid();
BEGIN

-- User 1
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data, raw_app_meta_data)
SELECT u1, 'authenticated', 'authenticated', 'user1@gmail.com', crypt('123456', gen_salt('bf')), now(), now(), now(),
  '{"username":"Korisnik1"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'user1@gmail.com');

-- User 2
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data, raw_app_meta_data)
SELECT u2, 'authenticated', 'authenticated', 'user2@gmail.com', crypt('123456', gen_salt('bf')), now(), now(), now(),
  '{"username":"Korisnik2"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'user2@gmail.com');

-- User 3
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data, raw_app_meta_data)
SELECT u3, 'authenticated', 'authenticated', 'user3@gmail.com', crypt('123456', gen_salt('bf')), now(), now(), now(),
  '{"username":"Korisnik3"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'user3@gmail.com');

-- User 4
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data, raw_app_meta_data)
SELECT u4, 'authenticated', 'authenticated', 'user4@gmail.com', crypt('123456', gen_salt('bf')), now(), now(), now(),
  '{"username":"Korisnik4"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'user4@gmail.com');

-- User 5
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data, raw_app_meta_data)
SELECT u5, 'authenticated', 'authenticated', 'user5@gmail.com', crypt('123456', gen_salt('bf')), now(), now(), now(),
  '{"username":"Korisnik5"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'user5@gmail.com');

-- Admin
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data, raw_app_meta_data)
SELECT ua, 'authenticated', 'authenticated', 'admin@gmail.com', crypt('123456', gen_salt('bf')), now(), now(), now(),
  '{"username":"Admin"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@gmail.com');

-- Create profiles
INSERT INTO profiles (id, username, color, is_admin)
SELECT id, 'Korisnik1', '#FF6B9D', false FROM auth.users WHERE email = 'user1@gmail.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, username, color, is_admin)
SELECT id, 'Korisnik2', '#5856D6', false FROM auth.users WHERE email = 'user2@gmail.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, username, color, is_admin)
SELECT id, 'Korisnik3', '#34C759', false FROM auth.users WHERE email = 'user3@gmail.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, username, color, is_admin)
SELECT id, 'Korisnik4', '#007AFF', false FROM auth.users WHERE email = 'user4@gmail.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, username, color, is_admin)
SELECT id, 'Korisnik5', '#AF52DE', false FROM auth.users WHERE email = 'user5@gmail.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, username, color, is_admin)
SELECT id, 'Admin', '#FF9500', true FROM auth.users WHERE email = 'admin@gmail.com'
ON CONFLICT (id) DO UPDATE SET is_admin = true;

END $$;

-- RLS policies for admin operations
CREATE POLICY IF NOT EXISTS "Admin can delete posts"
  ON posts FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY IF NOT EXISTS "Admin can update posts"
  ON posts FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY IF NOT EXISTS "Admin can update daily_highlights"
  ON daily_highlights FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY IF NOT EXISTS "Admin can delete comments"
  ON comments FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    OR auth.uid() = user_id
  );
