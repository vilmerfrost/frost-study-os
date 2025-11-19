# Testing Guide - YearBrain Sync

## Första steget: Starta servern

```bash
cd study-os
npm run dev
```

Servern startar på `http://localhost:3000`

## Testa YearBrain Upload

1. **Öppna Settings-sidan:**
   - Gå till `http://localhost:3000/settings`
   - Du ska se "YearBrain Sync" card

2. **Ladda upp filen:**
   - Klicka på upload-området
   - Välj `aebc63fe-43dd-447d-8a73-0bdd497a588c.md`
   - Vänta på "✅ YearBrain synkad!" meddelande

3. **Verifiera data:**
   - Phases ska visas automatiskt i "Synced Phases" card
   - Du ska se 5 phases med modules och topics

## Debugging

### Om phases inte visas:

1. **Kolla browser console:**
   - Öppna DevTools (F12)
   - Kolla Console-tab
   - Sök efter:
     - `🔄 Loading phases...`
     - `📥 Response status: 200`
     - `📦 Received data:`
     - `✅ Loaded X phases`

2. **Kolla server console:**
   - I terminalen där `npm run dev` körs
   - Sök efter:
     - `📋 Fetching phases for user:`
     - `✅ Found X phases`

3. **Testa API direkt:**
   ```bash
   # När servern körs:
   curl http://localhost:3000/api/phases/list
   ```

### Om du får "Unable to connect":
- Servern körs inte
- Starta med: `npm run dev`
- Vänta tills du ser: `Ready in X ms`

### Om API returnerar error:
- Kolla server console för detaljer
- Verifiera att migrationen kördes i Supabase
- Kolla att `SUPABASE_SERVICE_ROLE_KEY` är satt i `.env.local`

## Supabase Migration

Om data inte sparas, kör migrationen:

1. **Öppna Supabase Dashboard**
2. **Gå till SQL Editor**
3. **Kopiera innehållet från:**
   `migrations/20250118_yearbrain_core.sql`
4. **Kör SQL**

Eller via CLI:
```bash
supabase db push
```

## Checklist

- [ ] Dev server körs (`npm run dev`)
- [ ] Servern är tillgänglig på `localhost:3000`
- [ ] Migration kördes i Supabase
- [ ] `.env.local` har `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Upload lyckas (200 OK)
- [ ] Phases visas i Settings page

