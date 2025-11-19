// lib/srs/sm2.ts
// Enkel SM-2 implementation för spaced repetition

export interface ReviewItemState {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReviewAt?: string | null;
}

export interface Sm2Result {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReviewAt: Date;
}

/**
 * SM-2 algoritm enligt original SuperMemo 2
 * @param previous - tidigare state
 * @param quality - 0-5, där 5 är perfekt recall
 */
export function applySm2(previous: ReviewItemState, quality: number): Sm2Result {
  const now = new Date();
  let easeFactor = previous.easeFactor ?? 2.5;
  let repetitions = previous.repetitions ?? 0;
  let intervalDays = previous.intervalDays ?? 1;

  if (quality >= 3) {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetitions += 1;
  } else {
    repetitions = 0;
    intervalDays = 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextReviewAt = new Date(now);
  nextReviewAt.setDate(now.getDate() + Math.max(1, intervalDays));

  return {
    easeFactor,
    intervalDays,
    repetitions,
    nextReviewAt,
  };
}

/**
 * Beräknar initialt SM-2 state för nya review items
 */
export function initialSm2State(): ReviewItemState {
  return {
    easeFactor: 2.5,
    intervalDays: 1,
    repetitions: 0,
    nextReviewAt: null,
  };
}

