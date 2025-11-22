-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Table: energy_logs
create table if not exists energy_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null default current_date,
  score integer not null check (score >= 1 and score <= 5),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

-- Table: rules_config
create table if not exists rules_config (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  max_beast_days integer not null default 3,
  soft_week_interval integer not null default 6,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: curriculum
create table if not exists curriculum (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  phase text not null,
  week integer not null,
  topic text not null,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Basic)
alter table energy_logs enable row level security;
alter table rules_config enable row level security;
alter table curriculum enable row level security;

create policy "Users can view their own energy logs" on energy_logs
  for select using (auth.uid() = user_id);

create policy "Users can insert their own energy logs" on energy_logs
  for insert with check (auth.uid() = user_id);

create policy "Users can view their own rules config" on rules_config
  for select using (auth.uid() = user_id);

create policy "Users can update their own rules config" on rules_config
  for update using (auth.uid() = user_id);

create policy "Users can view their own curriculum" on curriculum
  for select using (auth.uid() = user_id);

create policy "Users can update their own curriculum" on curriculum
  for update using (auth.uid() = user_id);
