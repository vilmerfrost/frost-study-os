import { yearBrain, type YearDay, type YearModule, type PhaseId } from "@/config/yearBrain";

export const topicOptionsByPhase = yearBrain.phases.map((phase) => {
  const topics = yearBrain.modules
    .filter((m) => m.phase === phase.id)
    .map((module) => ({
      value: module.topicKey,
      label: module.title,
      shortLabel: module.shortTitle,
      moduleId: module.id,
      phaseId: module.phase,
    }));

  return {
    phaseId: phase.id,
    phaseLabel: phase.name,
    topics,
  };
});

export function getDefaultTopic(phase: PhaseId = 1): string {
  const group = topicOptionsByPhase.find((g) => g.phaseId === phase);
  return group?.topics[0]?.value || topicOptionsByPhase[0]?.topics[0]?.value || "linear_algebra_for_ml";
}

export function getYearDayByIndex(dayIndex: number): YearDay | undefined {
  return yearBrain.days.find((day) => day.dayIndex === dayIndex);
}

export function clampYearDayIndex(dayIndex: number): number {
  if (dayIndex < 1) return 1;
  if (dayIndex > yearBrain.days.length) return yearBrain.days.length;
  return dayIndex;
}

export function getNextYearDayIndex(current: number): number {
  return clampYearDayIndex(current + 1);
}

export function getYearModuleByTopic(topicKey: string): YearModule | undefined {
  return yearBrain.modules.find((module) => module.topicKey === topicKey);
}

export function getYearDaysForTopic(topicKey: string) {
  return yearBrain.days.filter((day) => day.topicKey === topicKey);
}

export function summarizeYearDay(dayIndex: number) {
  const yearDay = getYearDayByIndex(dayIndex);
  if (!yearDay) return null;
  const module = yearBrain.modules.find((m) => m.id === yearDay.moduleId);
  const phase = yearBrain.phases.find((p) => p.id === yearDay.phase);

  return {
    yearDay,
    module,
    phase,
  };
}

