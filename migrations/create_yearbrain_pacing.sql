-- Migration: Create yearbrain_pacing table for tracking phase adjustments
-- This enables adaptive YearBrain pacing based on user mastery

CREATE TABLE IF NOT EXISTS yearbrain_pacing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  phase INTEGER NOT NULL,
  adjustment TEXT NOT NULL, -- e.g. "extended_2_weeks", "skip_ahead", "compressed_1_week"
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by user and phase
CREATE INDEX IF NOT EXISTS idx_yearbrain_pacing_user_phase ON yearbrain_pacing(user_id, phase DESC);

