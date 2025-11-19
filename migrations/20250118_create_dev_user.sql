-- Quick fix: Create dev user manually
-- Run this in Supabase SQL Editor if the main migration fails

-- Option 1: Simple insert (may fail due to RLS)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'dev@study-os.local',
  crypt('dev', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  false,
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO NOTHING;

-- Option 2: If Option 1 fails, temporarily disable RLS
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;
-- Run Option 1 insert here
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Option 3: Use Supabase Dashboard
-- 1. Go to Authentication > Users
-- 2. Click "Add User"
-- 3. Set ID: 00000000-0000-0000-0000-000000000001
-- 4. Set Email: dev@study-os.local
-- 5. Set Password: dev (or any password)

