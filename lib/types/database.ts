/**
 * Database type definitions for Supabase tables.
 * 
 * These types correspond to the database schema defined in migrations.
 * Update these when schema changes.
 */

export interface ConceptMasteryRow {
  id: string;
  user_id: string;
  concept_id: string;
  mastery_score: number;
  last_practiced: string | null;
  struggling: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlannerOverrideRow {
  id: string;
  user_id: string;
  date: string;
  prev_day_type: string;
  new_day_type: string;
  reason: string | null;
  created_at: string;
}

export interface WeeklyInsightRow {
  id: string;
  user_id: string;
  week_start: string;
  summary: string;
  metrics: {
    totalDeepWorkHours: number;
    avgCompletionRate: number;
    phaseProgress: Record<number, number>;
    struggledConcepts: string[];
    totalSessions: number;
  };
  created_at: string;
}

export interface PlanGenerationJobRow {
  id: string;
  user_id: string;
  status: "pending" | "running" | "completed" | "failed";
  payload: any; // BuildPlanInput
  result: {
    plan: any; // StudyPlan
    markdown: string;
  } | null;
  progress: {
    analyzer: "queued" | "running" | "done";
    tutor: "queued" | "running" | "done";
    planner: "queued" | "running" | "done";
  };
  error: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface YearBrainPacingRow {
  id: string;
  user_id: string;
  phase: number;
  adjustment: string; // e.g. "extended_2_weeks", "skip_ahead"
  reason: string | null;
  created_at: string;
}

export interface StudySessionRow {
  id: string;
  user_id: string;
  topic: string;
  phase: number;
  energy: number;
  time_block: number;
  deep_dive_topic: string | null;
  deep_dive_day: number | null;
  plan: any; // StudyPlan JSON
  understanding_score: number | null;
  difficulty_score: number | null;
  mood_after: number | null;
  completion_rate: number | null;
  retention_importance: "low" | "medium" | "high" | null;
  reflection: string | null;
  planned_duration_min: number | null;
  actual_duration_min: number | null;
  underestimated: boolean | null;
  needs_reinforcement: boolean | null;
  created_at: string;
}

