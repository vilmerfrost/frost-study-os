# Quick Fix: Foreign Key Constraint Error

## Problem
```
insert or update on table "phases" violates foreign key constraint "phases_user_id_fkey"
```

## Snabbaste lösningen

### Steg 1: Skapa dev user i Supabase Dashboard

1. Öppna Supabase Dashboard
2. Gå till **Authentication** > **Users**
3. Klicka **"Add User"** eller **"Create User"**
4. Fyll i:
   - **ID**: `00000000-0000-0000-0000-000000000001`
   - **Email**: `dev@study-os.local`
   - **Password**: `dev` (eller valfritt)
5. Klicka **Save**

### Steg 2: Kör migrationen

1. Gå till **SQL Editor** i Supabase
2. Kopiera innehållet från `migrations/20250118_yearbrain_core.sql`
3. Kör SQL

### Steg 3: Testa upload igen

Gå till `/settings` och ladda upp YearBrain-filen igen.

## Alternativ: SQL direkt

Om Dashboard inte fungerar, kör detta i SQL Editor:

```sql
-- Skapa dev user
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
```

## Verifiera

Efter att ha skapat user, verifiera:

```sql
SELECT id, email FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000001';
```

Du ska se en rad med user.

## Om det fortfarande inte fungerar

Kör denna för att ta bort foreign key constraints (endast development):

```sql
ALTER TABLE phases DROP CONSTRAINT IF EXISTS phases_user_id_fkey;
ALTER TABLE flagship_projects DROP CONSTRAINT IF EXISTS flagship_projects_user_id_fkey;
ALTER TABLE energy_log DROP CONSTRAINT IF EXISTS energy_log_user_id_fkey;
```

**WARNING**: Bara för development! Ta inte bort constraints i production.

