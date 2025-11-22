-- =====================================================
-- Study OS 3.0 - Complete Database Schema Migration
-- =====================================================
-- This migration creates all necessary tables for the
-- fully functional Study OS 3.0 application.
-- =====================================================

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  timezone TEXT DEFAULT 'Europe/Stockholm',
  default_energy INTEGER DEFAULT 7 CHECK (default_energy BETWEEN 1 AND 10),
  default_sleep_hours DECIMAL(3,1) DEFAULT 7.5,
  ai_model_preference TEXT DEFAULT 'gemini' CHECK (ai_model_preference IN ('gemini', 'gpt4')),
  notifications_enabled BOOLEAN DEFAULT true,
  notification_time TIME DEFAULT '09:00:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. SESSIONS TABLE (Completed study sessions)
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID, -- References session_plans(id)
  topic TEXT NOT NULL,
  phase INTEGER NOT NULL CHECK (phase BETWEEN 1 AND 6),
  year_day INTEGER CHECK (year_day BETWEEN 1 AND 365),
  energy INTEGER CHECK (energy BETWEEN 1 AND 10),
  time_block INTEGER NOT NULL, -- Duration in minutes
  understanding_score INTEGER CHECK (understanding_score BETWEEN 1 AND 5),
  completion_rate INTEGER CHECK (completion_rate BETWEEN 0 AND 100),
  reflection TEXT,
  total_duration_ms BIGINT, -- Actual time spent
  blocks_completed JSONB, -- Array of completed block IDs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_sessions_user_created ON sessions(user_id, created_at DESC);
CREATE INDEX idx_sessions_phase ON sessions(phase);

-- ============================================
-- 3. SESSION_PLANS TABLE (AI-generated plans)
-- ============================================
CREATE TABLE IF NOT EXISTS session_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year_day INTEGER CHECK (year_day BETWEEN 1 AND 365),
  energy INTEGER NOT NULL CHECK (energy BETWEEN 1 AND 10),
  time_available INTEGER NOT NULL, -- Minutes
  mode TEXT NOT NULL CHECK (mode IN ('beast', 'balanced', 'recovery', 'soft')),
  blocks JSONB NOT NULL, -- Array of study blocks
  agent_logs JSONB, -- Agent pipeline execution logs
  generation_time_ms INTEGER,
  status TEXT DEFAULT 'generated' CHECK (status IN ('generated', 'active', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_session_plans_user_created ON session_plans(user_id, created_at DESC);

-- ============================================
-- 4. REVIEWS TABLE (SRS - Spaced Repetition)
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  subtopic TEXT NOT NULL,
  content TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  interval_days INTEGER DEFAULT 1,
  ease_factor DECIMAL(3,2) DEFAULT 2.5,
  repetitions INTEGER DEFAULT 0,
  next_review_date DATE NOT NULL,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_user_next ON reviews(user_id, next_review_date);
CREATE INDEX idx_reviews_topic ON reviews(topic);

-- ============================================
-- 5. YEAR_DAYS TABLE (365-day curriculum)
-- ============================================
CREATE TABLE IF NOT EXISTS year_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_index INTEGER UNIQUE NOT NULL CHECK (day_index BETWEEN 1 AND 365),
  phase INTEGER NOT NULL CHECK (phase BETWEEN 1 AND 6),
  module_id TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('learn', 'practice', 'review', 'project', 'checkpoint', 'rest')),
  focus_area TEXT NOT NULL,
  objectives JSONB, -- Array of learning objectives
  resources JSONB, -- Array of resource links
  micro_tasks JSONB, -- Array of small actionable tasks
  estimated_hours DECIMAL(3,1),
  description TEXT,
  ai_deep_dive TEXT, -- Cached AI explanation
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_year_days_phase ON year_days(phase);
CREATE INDEX idx_year_days_type ON year_days(type);

-- ============================================
-- 6. YEAR_PHASES TABLE (6 phases metadata)
-- ============================================
CREATE TABLE IF NOT EXISTS year_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_number INTEGER UNIQUE NOT NULL CHECK (phase_number BETWEEN 1 AND 6),
  title TEXT NOT NULL,
  focus_area TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  start_day INTEGER NOT NULL,
  end_day INTEGER NOT NULL,
  description TEXT,
  key_concepts JSONB, -- Array of main concepts
  ai_summary TEXT, -- Cached AI phase overview
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. REFLECTIONS TABLE (AM/PM check-ins)
-- ============================================
CREATE TABLE IF NOT EXISTS reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('morning', 'evening')),
  content TEXT NOT NULL,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  energy_before INTEGER CHECK (energy_before BETWEEN 1 AND 10),
  energy_after INTEGER CHECK (energy_after BETWEEN 1 AND 10),
  tags JSONB, -- Array of detected themes/tags
  ai_analysis TEXT, -- AI-generated insights
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reflections_user_created ON reflections(user_id, created_at DESC);
CREATE INDEX idx_reflections_type ON reflections(type);

-- ============================================
-- 8. AI_CACHE TABLE (Cache AI responses)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  prompt_hash TEXT NOT NULL,
  response TEXT NOT NULL,
  model TEXT NOT NULL,
  tokens_used INTEGER,
  generation_time_ms INTEGER,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_cache_key ON ai_cache(cache_key);
CREATE INDEX idx_ai_cache_expires ON ai_cache(expires_at);

-- ============================================
-- 9. ENERGY_SNAPSHOTS TABLE (Daily tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS energy_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  energy INTEGER NOT NULL CHECK (energy BETWEEN 1 AND 10),
  sleep_hours DECIMAL(3,1),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_energy_snapshots_user_date ON energy_snapshots(user_id, date DESC);

-- ============================================
-- 10. ACHIEVEMENTS TABLE (Gamification)
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL CHECK (achievement_type IN (
    'first_session', 'streak_7', 'streak_30', 'phase_complete', 
    'perfect_week', 'deep_work_master', 'review_champion'
  )),
  title TEXT NOT NULL,
  description TEXT,
  xp_awarded INTEGER DEFAULT 0,
  unlocked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_achievements_user ON achievements(user_id, unlocked_at DESC);

-- ============================================
-- ADD FOREIGN KEY for session_plans
-- ============================================
ALTER TABLE sessions 
ADD CONSTRAINT fk_sessions_plan 
FOREIGN KEY (plan_id) REFERENCES session_plans(id) ON DELETE SET NULL;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE year_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE year_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Single-user app: Lock to Vilmer's user ID
-- Replace 'YOUR_USER_UUID' with actual UUID after first user creation

-- Users table
CREATE POLICY users_select ON users FOR SELECT USING (true);
CREATE POLICY users_update ON users FOR UPDATE USING (auth.uid() = id);

-- Sessions table
CREATE POLICY sessions_all ON sessions FOR ALL USING (auth.uid() = user_id);

-- Session plans table
CREATE POLICY session_plans_all ON session_plans FOR ALL USING (auth.uid() = user_id);

-- Reviews table
CREATE POLICY reviews_all ON reviews FOR ALL USING (auth.uid() = user_id);

-- Year days (public read, admin write)
CREATE POLICY year_days_select ON year_days FOR SELECT USING (true);
CREATE POLICY year_days_update ON year_days FOR UPDATE USING (auth.uid() IN (
  SELECT id FROM users LIMIT 1
));

-- Year phases (public read, admin write)
CREATE POLICY year_phases_select ON year_phases FOR SELECT USING (true);

-- Reflections table
CREATE POLICY reflections_all ON reflections FOR ALL USING (auth.uid() = user_id);

-- AI cache (public read)
CREATE POLICY ai_cache_select ON ai_cache FOR SELECT USING (true);
CREATE POLICY ai_cache_insert ON ai_cache FOR INSERT WITH CHECK (true);

-- Energy snapshots table
CREATE POLICY energy_snapshots_all ON energy_snapshots FOR ALL USING (auth.uid() = user_id);

-- Achievements table
CREATE POLICY achievements_all ON achievements FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER year_days_updated_at
BEFORE UPDATE ON year_days
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SEED DATA - Initial Year Phases
-- ============================================
INSERT INTO year_phases (phase_number, title, focus_area, duration_days, start_day, end_day, description) VALUES
(1, 'Foundation', 'Mathematical & CS Fundamentals', 60, 1, 60, 'Build core mathematical foundations and programming skills'),
(2, 'Deep Learning', 'Linear Algebra & Calculus', 70, 61, 130, 'Master the mathematics behind machine learning'),
(3, 'Core ML', 'Classical Machine Learning', 65, 131, 195, 'Understand traditional ML algorithms and theory'),
(4, 'Neural Networks', 'Deep Learning & PyTorch', 60, 196, 255, 'Build and train neural networks'),
(5, 'Advanced Topics', 'NLP, Computer Vision, RL', 70, 256, 325, 'Specialize in modern AI domains'),
(6, 'Projects & Mastery', 'Real-world Applications', 40, 326, 365, 'Build portfolio projects and solidify knowledge')
ON CONFLICT (phase_number) DO NOTHING;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE users IS 'User profiles and preferences';
COMMENT ON TABLE sessions IS 'Completed study sessions with quality metrics';
COMMENT ON TABLE session_plans IS 'AI-generated study plans with execution tracking';
COMMENT ON TABLE reviews IS 'Spaced repetition review items (SRS system)';
COMMENT ON TABLE year_days IS '365-day curriculum structure';
COMMENT ON TABLE year_phases IS 'High-level phase metadata (6 phases)';
COMMENT ON TABLE reflections IS 'Morning and evening check-in reflections';
COMMENT ON TABLE ai_cache IS 'Cached AI responses to reduce API calls';
COMMENT ON TABLE energy_snapshots IS 'Daily energy, sleep, and stress tracking';
COMMENT ON TABLE achievements IS 'Gamification achievements and XP';
