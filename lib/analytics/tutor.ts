import type { DayType } from "@/lib/planEngine";

export function recommendDifficulty(
  qualityHistory: number[] = []
): "easy" | "medium" | "hard" {
  if (!qualityHistory.length) return "medium";
  const avg = qualityHistory.reduce((a, b) => a + b, 0) / qualityHistory.length;
  if (avg >= 4) return "hard";
  if (avg <= 2.5) return "easy";
  return "medium";
}

export function recommendBlockMix(
  dayType: DayType,
  weakTopics: string[]
): { emphasizeReview: boolean } {
  if (dayType === "minimum" || weakTopics.length > 0) {
    return { emphasizeReview: true };
  }
  return { emphasizeReview: false };
}

