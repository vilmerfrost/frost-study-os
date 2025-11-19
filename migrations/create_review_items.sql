-- Migration: Skapa review_items-tabell för spaced repetition
-- Kör i Supabase SQL Editor

CREATE TABLE IF NOT EXISTS review_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  topic TEXT NOT NULL,
  subtopic TEXT NOT NULL,
  last_review_at TIMESTAMP WITH TIME ZONE,
  next_review_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ease_factor NUMERIC DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  created_from_session_id UUID REFERENCES study_sessions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS review_items_topic_subtopic_idx
  ON review_items(topic, subtopic);

CREATE INDEX IF NOT EXISTS review_items_next_review_idx
  ON review_items(next_review_at);

