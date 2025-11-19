# Smart Features Setup Guide

## 🎯 Overview

Detta dokument beskriver hur du sätter upp de 5 nya smart features:
1. Google Calendar Sync
2. Resource Hunter (YouTube search)
3. Session Co-Pilot (AI chat)
4. NotebookLM Auto-Feed
5. AI Practice Problems

---

## 📋 Prerequisites

```bash
# Install dependencies
npm install googleapis
```

---

## 🔐 Environment Variables

Lägg till dessa i din `.env.local`:

```bash
# Google OAuth & APIs
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
YOUTUBE_API_KEY=your_youtube_api_key

# Ollama (optional, för AI features)
OLLAMA_BASE_URL=http://localhost:11434

# Supabase (existing)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🔧 Google Cloud Console Setup

### 1. Skapa OAuth 2.0 Credentials

1. Gå till [Google Cloud Console](https://console.cloud.google.com/)
2. Skapa ett nytt projekt eller välj befintligt
3. Gå till **APIs & Services** → **Credentials**
4. Klicka **Create Credentials** → **OAuth 2.0 Client ID**
5. Välj **Web application**
6. Lägg till **Authorized redirect URI**:
   - `http://localhost:3000/api/auth/google/callback` (dev)
   - `https://your-domain.com/api/auth/google/callback` (prod)

### 2. Enable APIs

Aktivera dessa APIs i Google Cloud Console:
- ✅ **Google Calendar API**
- ✅ **Google Docs API**
- ✅ **Google Drive API**
- ✅ **YouTube Data API v3**

### 3. Kopiera Credentials

Kopiera `Client ID` och `Client Secret` till `.env.local`

---

## 🗄️ Database Migrations

Kör migrations:

```bash
# Om du använder Supabase CLI
supabase db push

# Eller kör SQL direkt i Supabase Dashboard
# Fil: migrations/20250118_smart_features.sql
```

---

## 🧪 Testing

### 1. Google Calendar

1. Gå till `/settings`
2. Klicka "Koppla Google Calendar"
3. Följ OAuth flow
4. Verifiera att status visar "Kopplad"

### 2. Resource Hunter

1. Gå till `/today`
2. Scrolla ner till "Lärresurser"
3. Klicka "🔍 Hitta Resurser"
4. Verifiera att YouTube-videos visas

### 3. Co-Pilot

1. Klicka "💬 Öppna Co-Pilot" på `/today`
2. Ställ en fråga
3. Verifiera att streaming response fungerar

### 4. Practice Problems

1. Scrolla till "Övningsuppgifter" på `/today`
2. Klicka "✨ Generera Uppgifter"
3. Verifiera att problem visas
4. Testa "Visa Lösning"

### 5. NotebookLM Export

1. Efter en session, klicka "📝 Exportera till NotebookLM"
2. Verifiera att Google Doc skapas
3. Öppna länken i NotebookLM

---

## 🚀 Production Deployment

### Vercel Environment Variables

Lägg till alla `.env.local` variabler i Vercel Dashboard:
- Settings → Environment Variables

### Update Redirect URI

Uppdatera `GOOGLE_REDIRECT_URI` i Google Cloud Console till din production URL:
- `https://your-domain.com/api/auth/google/callback`

---

## 📝 Notes

- **Ollama Integration**: Co-Pilot och Practice Problems använder för nu en enkel mock. För full AI-funktionalitet, integrera Ollama client.
- **YouTube API**: Kräver API key från Google Cloud Console. Gratis tier: 10,000 requests/dag.
- **Google Calendar**: OAuth tokens sparas i `user_calendars` tabellen. Refresh tokens används automatiskt.

---

## 🐛 Troubleshooting

### "Calendar not connected"
- Verifiera att OAuth flow slutfördes
- Kolla `user_calendars` tabellen i Supabase
- Verifiera att `sync_enabled = true`

### "YouTube search failed"
- Verifiera `YOUTUBE_API_KEY` i `.env.local`
- Kolla API quota i Google Cloud Console
- Verifiera att YouTube Data API v3 är aktiverad

### "Co-Pilot not responding"
- Kolla browser console för errors
- Verifiera att SSE endpoint fungerar
- För full AI: starta Ollama lokalt (`ollama serve`)

---

## ✅ Checklist

- [ ] Google Cloud Console projekt skapat
- [ ] OAuth 2.0 credentials genererade
- [ ] APIs aktiverade (Calendar, Docs, Drive, YouTube)
- [ ] Environment variables satta i `.env.local`
- [ ] Migrations körda
- [ ] Google Calendar kopplad i `/settings`
- [ ] Resource Hunter testad
- [ ] Co-Pilot testad
- [ ] Practice Problems testad
- [ ] NotebookLM export testad

---

**Alla features är nu implementerade i Frost Bygg-stil! 🎉**

