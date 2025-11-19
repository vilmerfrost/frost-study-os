-- Smart Features Database Schema
-- Google Calendar Integration, Resource Hunter, Co-Pilot, NotebookLM, Practice Problems

-- 1. Google Calendar Integration
CREATE TABLE IF NOT EXISTS user_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  google_access_token TEXT,
  google_refresh_token TEXT,
  google_token_expiry TIMESTAMPTZ,
  calendar_id TEXT DEFAULT 'primary',
  sync_enabled BOOLEAN DEFAULT true,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Resource Hunter
CREATE TABLE IF NOT EXISTS session_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES study_sessions(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  resource_type TEXT, -- 'youtube', 'article', 'paper'
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail TEXT,
  duration TEXT, -- för videos
  relevance_score INT DEFAULT 0,
  added_to_notebooklm BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Co-Pilot Chat
CREATE TABLE IF NOT EXISTS copilot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES study_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. NotebookLM Exports
CREATE TABLE IF NOT EXISTS notebooklm_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES study_sessions(id) ON DELETE CASCADE,
  doc_title TEXT NOT NULL,
  doc_url TEXT, -- Google Docs link
  content TEXT,
  export_type TEXT DEFAULT 'session_summary',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Practice Problems
CREATE TABLE IF NOT EXISTS practice_problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES study_sessions(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  difficulty TEXT, -- 'easy', 'medium', 'hard'
  problem_text TEXT NOT NULL,
  solution TEXT,
  user_answer TEXT,
  is_correct BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_calendars_user ON user_calendars(user_id);
CREATE INDEX IF NOT EXISTS idx_session_resources_session ON session_resources(session_id);
CREATE INDEX IF NOT EXISTS idx_copilot_session ON copilot_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_practice_problems_session ON practice_problems(session_id);

