export type EnergyScore = 1 | 2 | 3 | 4 | 5;

export interface EnergyLog {
    id: string;
    user_id: string;
    date: string; // YYYY-MM-DD
    score: EnergyScore;
    notes?: string;
    created_at: string;
}

export interface RulesConfig {
    id: string;
    user_id: string;
    max_beast_days: number;
    soft_week_interval: number;
    created_at: string;
    updated_at: string;
}

export type CurriculumStatus = 'pending' | 'in_progress' | 'completed';

export interface CurriculumItem {
    id: string;
    user_id: string;
    phase: string;
    week: number;
    topic: string;
    status: CurriculumStatus;
    created_at: string;
    updated_at: string;
}

export type SystemMode = 'NORMAL' | 'FORCED_RECOVERY' | 'INTERVENTION';

export interface DailyState {
    mode: SystemMode;
    message: string;
    constraints: string[];
}
