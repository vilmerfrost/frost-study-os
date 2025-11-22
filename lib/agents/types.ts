export type AgentRole = "analyzer" | "tutor" | "planner" | "task_generator";

export type AgentStatus = "idle" | "running" | "completed" | "failed";

export interface AgentLog {
    agentName: string;
    timestamp: string;
    message: string;
    data?: any;
}

export interface StudyBlock {
    id: string;
    type: "deep_dive" | "review" | "practice" | "reflection";
    durationMinutes: number;
    topic: string;
    description: string;
    resources?: string[];
}

export interface StudyPlan {
    id: string;
    date: string;
    totalDuration: number;
    blocks: StudyBlock[];
    reasoning: string;
    confidence: number;
    alternatives?: string[];
}

export interface BuildPlanInput {
    userId: string;
    date: string;
    availableMinutes: number;
    energyLevel: number; // 1-10
    topicOverride?: string;
    mode: "beast" | "balanced" | "soft" | "recovery";
}

export interface AgentContext {
    input: BuildPlanInput;
    analysis?: any;
    tutorRecommendations?: any;
    draftPlan?: StudyPlan;
    logs: AgentLog[];
}
