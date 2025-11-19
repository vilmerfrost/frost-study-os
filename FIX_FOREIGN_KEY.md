# Fix Foreign Key Constraint Error

## Problem
```
insert or update on table "phases" violates foreign key constraint "phases_user_id_fkey"
```

Detta händer eftersom `user_id` måste referera till en existerande användare i `auth.users`, men vår placeholder user (`00000000-0000-0000-0000-000000000001`) finns inte där.

## Lösning

### Steg 1: Kör den uppdaterade migrationen

Migrationen har nu uppdaterats för att:
1. Skapa en dummy user automatiskt om den inte finns
2. Använda `DEFERRABLE` constraints som tillåter inserts även om user inte finns ännu

**Kör i Supabase SQL Editor:**
```sql
-- Kopiera hela innehållet från:
-- migrations/20250118_yearbrain_core.sql
```

### Steg 2: Om det fortfarande inte fungerar

**Alternativ A: Skapa user manuellt**
```sql
-- I Supabase SQL Editor
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
```

**Alternativ B: Ta bort foreign key constraint (endast development)**
```sql
-- WARNING: Bara för development!
ALTER TABLE phases DROP CONSTRAINT IF EXISTS phases_user_id_fkey;
ALTER TABLE flagship_projects DROP CONSTRAINT IF EXISTS flagship_projects_user_id_fkey;
ALTER TABLE energy_log DROP CONSTRAINT IF EXISTS energy_log_user_id_fkey;
```

**Alternativ C: Gör user_id nullable (endast development)**
```sql
-- WARNING: Bara för development!
ALTER TABLE phases ALTER COLUMN user_id DROP NOT NULL;
```

## Rekommenderad lösning

För development: Använd **Alternativ A** (skapa dummy user). Det är säkrast och behåller databasintegriteten.

För production: Implementera riktig authentication så att riktiga users skapas i `auth.users`.

