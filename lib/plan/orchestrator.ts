import { buildStudyPlan, type BuildPlanInput, type StudyPlan } from "@/lib/planEngine";
import { getWeeklyStats, getWeakTopics } from "@/lib/analytics/analyzer";
import { recommendBlockMix } from "@/lib/analytics/tutor";

interface OrchestratorOptions {
  respectUserInput?: boolean;
}

export async function buildPlanWithOrchestrator(
  input: BuildPlanInput,
  options?: OrchestratorOptions
): Promise<StudyPlan> {
  const [weeklyStats, weakTopics] = await Promise.all([
    getWeeklyStats(),
    getWeakTopics(),
  ]);

  const adjustedInput: BuildPlanInput = { ...input };

  if (!options?.respectUserInput) {
    if (weeklyStats.avgEnergy > 0) {
      adjustedInput.energy = Math.round(
        (adjustedInput.energy * 0.7 + weeklyStats.avgEnergy * 0.3) * 10
      ) / 10;
    }
    if (weeklyStats.sessions >= 5 && adjustedInput.day) {
      adjustedInput.energy = Math.max(2, adjustedInput.energy - 1);
    }
  }

  const plan = await buildStudyPlan(adjustedInput);

  const blockMixSuggestion = recommendBlockMix(plan.dayType || "normal", weakTopics.map((w) => w.topic));

  const insights: string[] = [];
  if (blockMixSuggestion.emphasizeReview) {
    insights.push("Rekommenderat: lägg extra tid på review-block idag.");
  }
  if (weakTopics.length) {
    insights.push(`Svagare topics: ${weakTopics.map((w) => w.topic).join(", ")}`);
  }

  return {
    ...plan,
    insights,
  };
}

