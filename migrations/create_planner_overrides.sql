-- Migration: Create planner_overrides table for tracking user overrides
-- This enables the planner to learn from user preferences

CREATE TABLE IF NOT EXISTS planner_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  prev_day_type TEXT NOT NULL,
  new_day_type TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by user and date
CREATE INDEX IF NOT EXISTS idx_planner_overrides_user_date ON planner_overrides(user_id, date DESC);

