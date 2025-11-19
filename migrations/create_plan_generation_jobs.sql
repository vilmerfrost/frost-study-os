-- Migration: Create plan_generation_jobs table for async plan generation
-- This enables SSE progress updates and non-blocking plan generation

CREATE TABLE IF NOT EXISTS plan_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  payload JSONB NOT NULL, -- Input parameters (topic, phase, energy, etc.)
  result JSONB, -- Final plan + reasoning
  progress JSONB DEFAULT '{}', -- e.g. { "analyzer": "done", "tutor": "running", "planner": "queued" }
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_jobs_status ON plan_generation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_user ON plan_generation_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_user_status ON plan_generation_jobs(user_id, status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_plan_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER plan_jobs_updated_at
  BEFORE UPDATE ON plan_generation_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_plan_jobs_updated_at();

