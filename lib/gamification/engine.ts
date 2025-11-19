export type DayType = "minimum" | "normal" | "beast" | "recovery";

export interface GamificationState {
  current_streak: number;
  longest_streak: number;
  total_xp: number;
  level: number;
  badges: string[];
  last_activity_date: string | null;
}

export interface GamificationUpdate {
  xpEarned: number;
  newLevel: number;
  streak: number;
  badgesUnlocked: string[];
}

const XP_PER_DAYTYPE: Record<DayType, number> = {
  minimum: 30,
  normal: 60,
  beast: 120,
  recovery: 20,
};

export function awardSessionXp(dayType: DayType, completionRate: number): number {
  const base = XP_PER_DAYTYPE[dayType] ?? 40;
  const multiplier = Math.max(0.4, completionRate / 100);
  return Math.round(base * multiplier);
}

export function updateStreak(
  lastActivityDate: string | null,
  today: Date
): { newStreak: number; lastActivityDate: string } {
  if (!lastActivityDate) {
    return { newStreak: 1, lastActivityDate: today.toISOString().slice(0, 10) };
  }

  const last = new Date(lastActivityDate);
  const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { newStreak: 1, lastActivityDate: lastActivityDate };
  }
  if (diffDays === 1) {
    return { newStreak: 1, lastActivityDate: today.toISOString().slice(0, 10) };
  }

  return { newStreak: 1, lastActivityDate: today.toISOString().slice(0, 10) };
}

export function checkBadges(state: GamificationState): string[] {
  const badges: string[] = [];

  if (state.current_streak >= 7 && !state.badges.includes("streak_7")) {
    badges.push("streak_7");
  }
  if (state.total_xp >= 1000 && !state.badges.includes("xp_1000")) {
    badges.push("xp_1000");
  }
  if (state.longest_streak >= 30 && !state.badges.includes("streak_30")) {
    badges.push("streak_30");
  }

  return badges;
}

export function calculateLevel(totalXp: number): number {
  return Math.max(1, Math.floor(totalXp / 500) + 1);
}

