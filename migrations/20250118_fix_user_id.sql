-- Fix foreign key constraint for development
-- This creates a dummy user if it doesn't exist, or modifies the constraint

-- Option 1: Create dummy user for development
-- Note: This only works if auth.users table exists and allows inserts
DO $$
BEGIN
  -- Try to insert dummy user if it doesn't exist
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
    role
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
    'authenticated'
  )
  ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN OTHERS THEN
    -- If we can't insert (e.g., RLS blocking), just continue
    RAISE NOTICE 'Could not create dummy user: %', SQLERRM;
END $$;

-- Option 2: Temporarily disable foreign key constraint for development
-- WARNING: Only use this in development, not production!
-- Uncomment the lines below if Option 1 doesn't work:

-- ALTER TABLE phases DROP CONSTRAINT IF EXISTS phases_user_id_fkey;
-- ALTER TABLE phases ADD CONSTRAINT phases_user_id_fkey 
--   FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
--   DEFERRABLE INITIALLY DEFERRED;

-- Or make it nullable for development:
-- ALTER TABLE phases ALTER COLUMN user_id DROP NOT NULL;

