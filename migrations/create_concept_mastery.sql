-- Migration: Create concept_mastery table for tracking mastery per concept
-- This enables the Intelligent Context Engine to track learning progress

CREATE TABLE IF NOT EXISTS concept_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  concept_id TEXT NOT NULL,
  mastery_score INTEGER NOT NULL DEFAULT 0 CHECK (mastery_score >= 0 AND mastery_score <= 100),
  last_practiced TIMESTAMPTZ,
  struggling BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, concept_id)
);

-- Index for fast lookups by user and concept
CREATE INDEX IF NOT EXISTS idx_concept_mastery_user_concept ON concept_mastery(user_id, concept_id);
CREATE INDEX IF NOT EXISTS idx_concept_mastery_struggling ON concept_mastery(user_id, struggling) WHERE struggling = true;
CREATE INDEX IF NOT EXISTS idx_concept_mastery_phase ON concept_mastery(user_id, concept_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_concept_mastery_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER concept_mastery_updated_at
  BEFORE UPDATE ON concept_mastery
  FOR EACH ROW
  EXECUTE FUNCTION update_concept_mastery_updated_at();

