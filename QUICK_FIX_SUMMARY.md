# Quick Fix Summary - YearBrain Sync

## Problem
- Upload lyckas (200 OK)
- Men `/api/phases/list` returnerar `{"phases":[]}`
- Data sparas inte i databasen

## Fixar implementerade

### 1. Förbättrad Error Handling i Sync
- ✅ Tydligare error messages
- ✅ Verifiering att phase faktiskt skapades
- ✅ Logging av insert/update operations
- ✅ Throw errors istället för att bara logga

### 2. Verifiering efter Sync
- ✅ Kontrollerar att data faktiskt sparades
- ✅ Listar alla phases efter sync
- ✅ Varnar om data saknas

### 3. Bättre Debugging i List API
- ✅ Loggar om inga phases hittas
- ✅ Kontrollerar om tabellen finns
- ✅ Visar sample data för debugging

## Nästa steg för att testa

1. **Kör migrationen i Supabase:**
   - Öppna Supabase Dashboard
   - SQL Editor
   - Kopiera innehållet från `migrations/20250118_yearbrain_core.sql`
   - Kör SQL

2. **Verifiera environment variables:**
   - Kolla att `.env.local` har:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_url
     SUPABASE_SERVICE_ROLE_KEY=your_key
     ```

3. **Testa upload igen:**
   - Ladda upp YearBrain-filen
   - Kolla server console för detaljerad logging
   - Kolla browser console för errors

4. **Om det fortfarande inte fungerar:**
   - Kolla server console för specifika errors
   - Verifiera att tabellerna finns i Supabase
   - Testa direkt SQL query i Supabase:
     ```sql
     SELECT * FROM phases WHERE user_id = '00000000-0000-0000-0000-000000000001';
     ```

## Vanliga problem

### "relation does not exist"
- Migrationen har inte körts
- Kör migrationen i Supabase

### "permission denied"
- RLS policies blockerar
- Verifiera att service role key är korrekt
- Kolla RLS policies i migrationen

### "invalid input syntax for type uuid"
- user_id är inte korrekt format
- Verifiera att user_id är en valid UUID

