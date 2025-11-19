-- Migration: Lägg till kolumner för closed learning loop i study_sessions
-- Kör denna i Supabase SQL Editor

ALTER TABLE study_sessions
ADD COLUMN IF NOT EXISTS understanding_score INTEGER CHECK (understanding_score >= 1 AND understanding_score <= 5),
ADD COLUMN IF NOT EXISTS difficulty_score INTEGER CHECK (difficulty_score >= 1 AND difficulty_score <= 5),
ADD COLUMN IF NOT EXISTS mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 5),
ADD COLUMN IF NOT EXISTS retention_importance TEXT CHECK (retention_importance IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS reflection TEXT,
ADD COLUMN IF NOT EXISTS completion_rate INTEGER CHECK (completion_rate >= 0 AND completion_rate <= 100);

-- Index för att snabbt hitta sessions med hög retention_importance
CREATE INDEX IF NOT EXISTS idx_sessions_retention_importance ON study_sessions(retention_importance) WHERE retention_importance = 'high';

