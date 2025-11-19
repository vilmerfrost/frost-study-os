-- YearBrain Core Database Schema
-- Sprint 1: Full YearBrain Structure

-- ============================================
-- YEARBRAIN CORE TABLES
-- ============================================

-- 1. Phases (6 phases över 12 månader)
CREATE TABLE IF NOT EXISTS phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- Foreign key added separately to allow dev user creation
  phase_number INT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_month INT NOT NULL, -- 1-12
  end_month INT NOT NULL,
  duration_weeks INT NOT NULL, -- 12 weeks per phase
  flagship_project TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  progress_percentage INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, phase_number)
);

-- 2. Modules (Learning modules within phases)
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID REFERENCES phases(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  order_index INT NOT NULL,
  week_start INT NOT NULL, -- Relative to phase (1-12)
  week_end INT NOT NULL,
  mastery_target INT DEFAULT 80, -- Target mastery %
  current_mastery INT DEFAULT 0,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Topics (Granular topics within modules)
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  order_index INT NOT NULL,
  prerequisites TEXT[] DEFAULT '{}', -- Array of topic IDs
  estimated_hours FLOAT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  mastery_score INT DEFAULT 0 CHECK (mastery_score BETWEEN 0 AND 100),
  is_locked BOOLEAN DEFAULT false, -- Based on prerequisites
  last_studied TIMESTAMPTZ,
  total_time_spent INT DEFAULT 0, -- minutes
  session_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Flagship Projects (ML Foundry, Night Factory, etc)
CREATE TABLE IF NOT EXISTS flagship_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  phase_id UUID REFERENCES phases(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  tier INT CHECK (tier IN (1, 2, 3)),
  status TEXT DEFAULT 'conceptual' CHECK (status IN ('conceptual', 'active', 'shipped', 'maintenance')),
  target_completion_date DATE,
  progress_percentage INT DEFAULT 0,
  github_repo TEXT,
  demo_url TEXT,
  last_activity TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Project Milestones (Sub-goals for flagships)
CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES flagship_projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  order_index INT NOT NULL,
  target_week INT, -- Relative to phase
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Checkpoints (Phase checkpoints)
CREATE TABLE IF NOT EXISTS checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID REFERENCES phases(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  week_number INT NOT NULL, -- Usually week 6, 12
  criteria JSONB, -- Array of checkpoint requirements
  readiness_score INT DEFAULT 0, -- 0-100 based on related topic mastery
  is_passed BOOLEAN DEFAULT false,
  passed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Energy Log (Daily energy tracking)
CREATE TABLE IF NOT EXISTS energy_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  energy_level INT CHECK (energy_level BETWEEN 1 AND 5),
  day_type TEXT CHECK (day_type IN ('minimum', 'normal', 'beast')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 8. Six-Week Blocks (Track 6-week cycles)
CREATE TABLE IF NOT EXISTS six_week_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID REFERENCES phases(id) ON DELETE CASCADE NOT NULL,
  block_number INT NOT NULL, -- 1 or 2 per phase
  week_start INT NOT NULL,
  week_end INT NOT NULL,
  focus_type TEXT, -- 'learn_build', 'steal_ship', 'integration'
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RESOURCE LIBRARY
-- ============================================

CREATE TABLE IF NOT EXISTS topic_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  resource_type TEXT CHECK (resource_type IN ('video', 'article', 'interactive', 'paper', 'course')),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail TEXT,
  source TEXT, -- '3Blue1Brown', 'Khan Academy', etc
  relevance_score INT DEFAULT 50,
  is_curated BOOLEAN DEFAULT false, -- AI pre-curated vs user-added
  user_rating INT CHECK (user_rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_phases_user ON phases(user_id, status);
CREATE INDEX IF NOT EXISTS idx_modules_phase ON modules(phase_id, order_index);
CREATE INDEX IF NOT EXISTS idx_topics_module ON topics(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_topics_mastery ON topics(mastery_score);
CREATE INDEX IF NOT EXISTS idx_flagship_projects_user ON flagship_projects(user_id, status);
CREATE INDEX IF NOT EXISTS idx_energy_log_user_date ON energy_log(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_topic_resources_topic ON topic_resources(topic_id, relevance_score DESC);

-- ============================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================

-- Add foreign key constraints (deferrable for development)
DO $$
BEGIN
  -- Phases foreign key
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'phases_user_id_fkey'
  ) THEN
    ALTER TABLE phases ADD CONSTRAINT phases_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
      DEFERRABLE INITIALLY DEFERRED;
  END IF;
  
  -- Flagship projects foreign key
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'flagship_projects_user_id_fkey'
  ) THEN
    ALTER TABLE flagship_projects ADD CONSTRAINT flagship_projects_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
      DEFERRABLE INITIALLY DEFERRED;
  END IF;
  
  -- Energy log foreign key
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'energy_log_user_id_fkey'
  ) THEN
    ALTER TABLE energy_log ADD CONSTRAINT energy_log_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
      DEFERRABLE INITIALLY DEFERRED;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- If auth.users doesn't exist or constraint fails, create without FK
    RAISE NOTICE 'Could not add foreign key constraints: %', SQLERRM;
END $$;

-- Create dummy dev user if it doesn't exist
DO $$
BEGIN
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  )
  VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'dev@study-os.local',
    crypt('dev', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    'authenticated'
  )
  ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'auth.users table does not exist, skipping user creation';
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not create dummy user: %', SQLERRM;
END $$;

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE flagship_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own phases" ON phases;
DROP POLICY IF EXISTS "Users can view own projects" ON flagship_projects;
DROP POLICY IF EXISTS "Users can view own energy log" ON energy_log;
DROP POLICY IF EXISTS "Users can insert own energy log" ON energy_log;

-- Allow service role to bypass RLS (for server-side operations)
CREATE POLICY "Users can view own phases" ON phases FOR SELECT USING (auth.uid() = user_id OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');
CREATE POLICY "Users can insert own phases" ON phases FOR INSERT WITH CHECK (auth.uid() = user_id OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');
CREATE POLICY "Users can update own phases" ON phases FOR UPDATE USING (auth.uid() = user_id OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');
CREATE POLICY "Users can delete own phases" ON phases FOR DELETE USING (auth.uid() = user_id OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

CREATE POLICY "Users can view own projects" ON flagship_projects FOR SELECT USING (auth.uid() = user_id OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');
CREATE POLICY "Users can insert own projects" ON flagship_projects FOR INSERT WITH CHECK (auth.uid() = user_id OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');
CREATE POLICY "Users can update own projects" ON flagship_projects FOR UPDATE USING (auth.uid() = user_id OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

CREATE POLICY "Users can view own modules" ON modules FOR SELECT USING (
  EXISTS (SELECT 1 FROM phases WHERE phases.id = modules.phase_id AND (phases.user_id = auth.uid() OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'))
);
CREATE POLICY "Users can insert own modules" ON modules FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM phases WHERE phases.id = modules.phase_id AND (phases.user_id = auth.uid() OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'))
);
CREATE POLICY "Users can delete own modules" ON modules FOR DELETE USING (
  EXISTS (SELECT 1 FROM phases WHERE phases.id = modules.phase_id AND (phases.user_id = auth.uid() OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'))
);

CREATE POLICY "Users can view own topics" ON topics FOR SELECT USING (
  EXISTS (SELECT 1 FROM modules JOIN phases ON phases.id = modules.phase_id WHERE modules.id = topics.module_id AND (phases.user_id = auth.uid() OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'))
);
CREATE POLICY "Users can insert own topics" ON topics FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM modules JOIN phases ON phases.id = modules.phase_id WHERE modules.id = topics.module_id AND (phases.user_id = auth.uid() OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'))
);
CREATE POLICY "Users can delete own topics" ON topics FOR DELETE USING (
  EXISTS (SELECT 1 FROM modules JOIN phases ON phases.id = modules.phase_id WHERE modules.id = topics.module_id AND (phases.user_id = auth.uid() OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'))
);

CREATE POLICY "Users can view own checkpoints" ON checkpoints FOR SELECT USING (
  EXISTS (SELECT 1 FROM phases WHERE phases.id = checkpoints.phase_id AND (phases.user_id = auth.uid() OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'))
);
CREATE POLICY "Users can insert own checkpoints" ON checkpoints FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM phases WHERE phases.id = checkpoints.phase_id AND (phases.user_id = auth.uid() OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'))
);
CREATE POLICY "Users can delete own checkpoints" ON checkpoints FOR DELETE USING (
  EXISTS (SELECT 1 FROM phases WHERE phases.id = checkpoints.phase_id AND (phases.user_id = auth.uid() OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'))
);

CREATE POLICY "Users can view own energy log" ON energy_log FOR SELECT USING (auth.uid() = user_id OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');
CREATE POLICY "Users can insert own energy log" ON energy_log FOR INSERT WITH CHECK (auth.uid() = user_id OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

