import { phasesConfig } from "@/lib/config/phases";
import { deepDiveConfigs } from "@/lib/config/deepDives";

export interface SessionSummary {
  phase: number;
  time_block: number | null;
  deep_dive_topic?: string | null;
  deep_dive_day?: number | null;
}

export interface PhaseProgress {
  phaseId: number;
  label: string;
  targetHours: number;
  currentHours: number;
  percent: number;
  recommendedDeepDiveDays: number;
}

export interface DeepDiveProgress {
  topic: string;
  totalDays: number;
  completedDays: number;
  percent: number;
}

export function calculatePhaseProgress(
  sessions: SessionSummary[]
): PhaseProgress[] {
  const totals = new Map<number, number>();

  sessions.forEach((session) => {
    const minutes = session.time_block || 0;
    const current = totals.get(session.phase) || 0;
    totals.set(session.phase, current + minutes);
  });

  return phasesConfig.map((phase) => {
    const totalMinutes = totals.get(phase.id) || 0;
    const currentHours = Math.round((totalMinutes / 60) * 10) / 10;
    const percent = Math.min(100, Math.round((currentHours / phase.targetHours) * 100));

    return {
      phaseId: phase.id,
      label: phase.label,
      targetHours: phase.targetHours,
      currentHours,
      percent,
      recommendedDeepDiveDays: phase.recommendedDeepDiveDays,
    };
  });
}

export function calculateDeepDiveProgress(
  sessions: SessionSummary[]
): DeepDiveProgress[] {
  const progressMap = new Map<
    string,
    { totalDays: number; completedDays: Set<number> }
  >();

  Object.entries(deepDiveConfigs).forEach(([topic, config]) => {
    progressMap.set(topic, { totalDays: config.days.length, completedDays: new Set() });
  });

  sessions.forEach((session) => {
    if (!session.deep_dive_topic || !session.deep_dive_day) return;
    const progress = progressMap.get(session.deep_dive_topic);
    if (!progress) return;
    progress.completedDays.add(session.deep_dive_day);
  });

  return Array.from(progressMap.entries()).map(([topic, info]) => {
    const completedDays = info.completedDays.size;
    const percent = Math.min(100, Math.round((completedDays / info.totalDays) * 100));
    return {
      topic,
      totalDays: info.totalDays,
      completedDays,
      percent,
    };
  });
}

