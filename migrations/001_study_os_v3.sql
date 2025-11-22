-- Migration: 001_study_os_v3
-- Description: Adds tables for YearBrain state and async plan generation.

-- 1. User Settings for YearBrain State
create table if not exists user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_day_index integer not null default 1,
  preferred_mode text not null default 'balanced' check (preferred_mode in ('beast', 'balanced', 'soft', 'recovery')),
  last_advanced_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table user_settings enable row level security;

-- Policies
create policy "Users can view their own settings"
  on user_settings for select
  using (auth.uid() = user_id);

create policy "Users can update their own settings"
  on user_settings for update
  using (auth.uid() = user_id);

create policy "Users can insert their own settings"
  on user_settings for insert
  with check (auth.uid() = user_id);

-- 2. Async Plan Generation Jobs
create table if not exists plan_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  input jsonb not null,
  result jsonb,
  error text,
  progress integer default 0 check (progress >= 0 and progress <= 100),
  agent_logs jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz,
  completed_at timestamptz
);

-- Enable RLS
alter table plan_generation_jobs enable row level security;

-- Policies
create policy "Users can view their own jobs"
  on plan_generation_jobs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own jobs"
  on plan_generation_jobs for insert
  with check (auth.uid() = user_id);

-- Indexes for performance
create index idx_plan_jobs_user_status on plan_generation_jobs(user_id, status);
create index idx_plan_jobs_created_at on plan_generation_jobs(created_at desc);
