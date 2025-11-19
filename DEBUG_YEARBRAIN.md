# YearBrain Sync Debugging Guide

## Problem: Data synkas men visas inte efter reload

### Symptom
- Upload lyckas (200 OK, success: true)
- Console visar: `5 phases, 2 projects, 19 modules`
- Men UI visar: "0 phases loaded"

### Lösningar implementerade

1. **API Route Fix** (`/api/phases/list`)
   - Använder samma `user_id` som sync route
   - Lagt till logging för debugging
   - Returnerar phases med modules, topics, checkpoints

2. **Settings Page Fix**
   - Bättre error handling
   - Logging för att se vad som händer
   - Auto-reload efter sync

3. **RLS Policies**
   - Uppdaterade för att tillåta service role
   - Bevarar säkerhet för vanliga användare

### Debugging Steps

1. **Kolla server console** när du laddar `/settings`:
   ```
   📋 Fetching phases for user: 00000000-0000-0000-0000-000000000001
   ✅ Found X phases
   ```

2. **Kolla browser console** när du laddar phases:
   ```
   🔄 Loading phases...
   📥 Response status: 200
   📦 Received data: {phases: [...]}
   ✅ Loaded X phases
   ```

3. **Om phases är tomma:**
   - Verifiera att migrationen kördes
   - Kolla att data faktiskt sparas (Supabase dashboard)
   - Verifiera att `user_id` matchar mellan sync och list

4. **Om API returnerar error:**
   - Kolla server console för detaljer
   - Verifiera RLS policies i Supabase
   - Kolla att tabellerna finns

### Test Checklist

- [ ] Migration kördes i Supabase
- [ ] Upload lyckas (200 OK)
- [ ] Data finns i Supabase (kolla dashboard)
- [ ] `/api/phases/list` returnerar data
- [ ] Settings page visar phases
- [ ] Phases uppdateras efter sync utan reload

### Nästa steg om det fortfarande inte fungerar

1. Kolla Supabase dashboard direkt:
   ```sql
   SELECT * FROM phases WHERE user_id = '00000000-0000-0000-0000-000000000001';
   ```

2. Testa API route direkt:
   ```bash
   curl http://localhost:3000/api/phases/list
   ```

3. Kolla RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'phases';
   ```

