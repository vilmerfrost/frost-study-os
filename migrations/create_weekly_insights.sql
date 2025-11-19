-- Migration: Create weekly_insights table for storing AI-generated weekly summaries
-- This enables Coach Mode weekly retrospectives

CREATE TABLE IF NOT EXISTS weekly_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  summary TEXT NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, week_start)
);

-- Index for fast lookups by user and week
CREATE INDEX IF NOT EXISTS idx_weekly_insights_user_week ON weekly_insights(user_id, week_start DESC);

-- Example metrics structure:
-- {
--   "totalDeepWorkHours": 12.5,
--   "phaseProgress": { "phase1": 0.78, "phase2": 0.0 },
--   "struggledConcepts": ["linear_algebra.eigenvectors"],
--   "topWins": ["Completed 5 sessions", "Mastered probability basics"]
-- }

