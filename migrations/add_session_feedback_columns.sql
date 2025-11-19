-- Migration: Add feedback columns to study_sessions for closed-loop learning
-- This enables the planner to adapt based on actual vs planned performance

ALTER TABLE study_sessions
ADD COLUMN IF NOT EXISTS planned_duration_min INTEGER,
ADD COLUMN IF NOT EXISTS actual_duration_min INTEGER,
ADD COLUMN IF NOT EXISTS underestimated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS needs_reinforcement BOOLEAN DEFAULT false;

-- Index for fast lookups of sessions needing reinforcement
CREATE INDEX IF NOT EXISTS idx_sessions_needs_reinforcement ON study_sessions(user_id, needs_reinforcement) WHERE needs_reinforcement = true;
CREATE INDEX IF NOT EXISTS idx_sessions_underestimated ON study_sessions(user_id, underestimated) WHERE underestimated = true;

