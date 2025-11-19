export type BlockType = "notebooklm" | "theory" | "exercises" | "summary";

export type Difficulty = "easy" | "medium" | "hard";

export interface StudyBlock {
  type: BlockType;
  duration: number;
  description: string;
  goal?: string;
  level?: Difficulty;
  notebooklmSource?: string;
  tasks?: string[];
  aiGeneratedTasks?: string[];
}

export type DayType = "minimum" | "normal" | "beast" | "recovery";

export interface DayPlan {
  day: number;
  dayType: DayType;
  energy: number;
  timeBlock: number;
  blocks: StudyBlock[];
  date?: string;
  notes?: string;
}

export interface BuildPlanInput {
  topic: string;
  phase: number;
  energy: number;
  timeBlock: number;
  deepDiveTopic?: string;
  day?: number;
  generateWeekPlan?: boolean;
  numDays?: number;
  energyPattern?: number[];
  yearDayIndex?: number;
}

export interface PlanReasoning {
  dayType: string; // e.g. "Normal day, max 3h fokus"
  energyLabel: string;
  blockMix: string; // e.g. "Extra LA theory block pga struggle igår"
  tasksFocus: string; // e.g. "Fokus på eigenvectors (mastery 45%)"
  safetyRules: string[]; // e.g. ["3 Beast-dagar i rad → auto-soft week"]
  difficultyReasoning?: string; // e.g. "Medium difficulty (LA mastery 67%, energy 3)"
}

export interface StudyPlan {
  topic: string;
  phase: number;
  energy: number;
  timeBlock: number;
  profile: "minimum" | "normal" | "beast";
  intensityLevel: 1 | 2 | 3;
  dayType?: DayType;
  deepDiveMode: boolean;
  deepDiveTopicId?: string;
  deepDiveDay?: number;
  deepDiveName?: string;
  deepDiveSubtopics?: string[];
  deepDiveWhy?: string;
  blocks: StudyBlock[];
  isWeekPlan?: boolean;
  dayPlans?: DayPlan[];
  insights?: string[];
  reasoning?: PlanReasoning; // Added for Phase 2
}

