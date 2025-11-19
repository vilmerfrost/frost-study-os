import type { Difficulty } from "./types";

/**
 * Result of difficulty calculation with reasoning.
 */
export interface DifficultyDecision {
  level: Difficulty;
  reasoning: string;
}

/**
 * Calculate adaptive difficulty based on concept mastery, energy, and recent struggles.
 * 
 * This enables the planner to adjust task difficulty dynamically based on:
 * - How well the user has mastered the concept (0-100)
 * - Current energy level (1-5)
 * - Whether they've been struggling recently
 * 
 * Algorithm:
 * 1. Base difficulty on mastery score (75+ = hard, 50-74 = medium, <50 = easy)
 * 2. Adjust based on energy (high energy → harder, low energy → easier)
 * 3. Lower difficulty if user is struggling
 * 
 * @param opts - Difficulty calculation parameters
 * @returns Difficulty decision with reasoning
 */
export function calculateDifficulty(opts: {
  conceptMastery?: number; // 0-100
  energy: number; // 1-5
  recentlyStruggling: boolean;
  phase?: number; // YearBrain phase (1-4)
}): DifficultyDecision {
  const { conceptMastery, energy, recentlyStruggling, phase = 1 } = opts;

  // Base difficulty on mastery if available
  let baseLevel: Difficulty = "medium";
  let masteryReasoning = "";

  if (conceptMastery !== undefined) {
    if (conceptMastery >= 75) {
      baseLevel = "hard";
      masteryReasoning = `hög mastery (${conceptMastery}%)`;
    } else if (conceptMastery >= 50) {
      baseLevel = "medium";
      masteryReasoning = `medel mastery (${conceptMastery}%)`;
    } else {
      baseLevel = "easy";
      masteryReasoning = `läg mastery (${conceptMastery}%)`;
    }
  }

  // Adjust based on energy
  let energyAdjustment = 0;
  if (energy <= 2) {
    energyAdjustment = -1; // Lower difficulty
  } else if (energy >= 4) {
    energyAdjustment = 1; // Higher difficulty
  }

  // Adjust based on recent struggles
  if (recentlyStruggling) {
    energyAdjustment -= 1; // Lower difficulty if struggling
  }

  // Apply adjustments
  let finalLevel: Difficulty = baseLevel;
  if (energyAdjustment < 0 && baseLevel === "hard") {
    finalLevel = "medium";
  } else if (energyAdjustment < 0 && baseLevel === "medium") {
    finalLevel = "easy";
  } else if (energyAdjustment > 0 && baseLevel === "easy") {
    finalLevel = "medium";
  } else if (energyAdjustment > 0 && baseLevel === "medium") {
    finalLevel = "hard";
  }

  // Build reasoning string
  const parts: string[] = [];
  if (masteryReasoning) {
    parts.push(masteryReasoning);
  }
  if (energy <= 2) {
    parts.push("låg energi");
  } else if (energy >= 4) {
    parts.push("hög energi");
  }
  if (recentlyStruggling) {
    parts.push("nyligen kämpat");
  }

  const reasoning = parts.length > 0
    ? `${finalLevel === "easy" ? "Lätt" : finalLevel === "medium" ? "Medel" : "Svår"} nivå (${parts.join(", ")})`
    : `${finalLevel === "easy" ? "Lätt" : finalLevel === "medium" ? "Medel" : "Svår"} nivå`;

  return {
    level: finalLevel,
    reasoning,
  };
}

