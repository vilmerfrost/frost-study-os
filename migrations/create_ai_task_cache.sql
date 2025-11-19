-- Migration: Create ai_task_cache table for caching AI-generated tasks
-- This reduces LLM calls by reusing tasks generated in the last 24 hours

CREATE TABLE IF NOT EXISTS ai_task_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  subtopics TEXT[] NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tasks TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_ai_task_cache_lookup ON ai_task_cache(topic, difficulty, expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_task_cache_user ON ai_task_cache(user_id);

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_ai_tasks()
RETURNS void AS $$
BEGIN
  DELETE FROM ai_task_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

