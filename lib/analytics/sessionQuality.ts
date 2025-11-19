// lib/analytics/sessionQuality.ts
// Utility för att beräkna session quality baserat på feedback

export interface SessionQualityInput {
  understanding_score: number; // 1-5
  difficulty_score: number; // 1-5
  mood_after: number; // 1-5
  completion_rate: number; // 0-100
}

/**
 * Beräknar en quality score (0-1) baserat på session feedback
 * Högre score = bättre session
 */
export function calculateSessionQuality(input: SessionQualityInput): number {
  const { understanding_score, difficulty_score, mood_after, completion_rate } = input;

  // Normalisera alla värden till 0-1
  const understandingNorm = (understanding_score - 1) / 4; // 1->0, 5->1
  const difficultyNorm = (6 - difficulty_score) / 4; // 1->1.25, 5->0.25 (inverterat - lägre difficulty = bättre)
  const moodNorm = (mood_after - 1) / 4; // 1->0, 5->1
  const completionNorm = completion_rate / 100; // 0->0, 100->1

  // Viktning: understanding och completion är viktigast
  const weights = {
    understanding: 0.35,
    difficulty: 0.15,
    mood: 0.20,
    completion: 0.30,
  };

  const qualityScore =
    understandingNorm * weights.understanding +
    difficultyNorm * weights.difficulty +
    moodNorm * weights.mood +
    completionNorm * weights.completion;

  // Clamp till 0-1
  return Math.max(0, Math.min(1, qualityScore));
}

/**
 * Kategoriserar quality score i text
 */
export function getQualityLabel(score: number): string {
  if (score >= 0.8) return "Utmärkt";
  if (score >= 0.6) return "Bra";
  if (score >= 0.4) return "Okej";
  if (score >= 0.2) return "Svårt";
  return "Mycket svårt";
}

