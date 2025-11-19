import { supabaseServer } from "@/lib/supabaseServer";
import {
  awardSessionXp,
  calculateLevel,
  checkBadges,
  type DayType,
  type GamificationState,
} from "@/lib/gamification/engine";

export interface GamificationOverview {
  streak: number;
  longestStreak: number;
  totalXp: number;
  level: number;
  badges: string[];
}

const USER_ID = "00000000-0000-0000-0000-000000000001";

async function getState(): Promise<GamificationState> {
  const { data, error } = await supabaseServer
    .from("user_gamification")
    .select("*")
    .eq("user_id", USER_ID)
    .single();

  if (error || !data) {
    throw new Error("Could not load gamification state");
  }

  return {
    current_streak: data.current_streak,
    longest_streak: data.longest_streak,
    total_xp: data.total_xp,
    level: data.level,
    badges: data.badges || [],
    last_activity_date: data.last_activity_date,
  };
}

export async function recordSessionGamification(
  params: { dayType: DayType; completionRate: number; sessionDate?: Date }
) {
  const state = await getState();
  const xpEarned = awardSessionXp(params.dayType, params.completionRate);
  const totalXp = state.total_xp + xpEarned;
  const newLevel = calculateLevel(totalXp);

  const today = params.sessionDate ?? new Date();
  const todayStr = today.toISOString().slice(0, 10);

  let newStreak = state.current_streak;
  if (!state.last_activity_date) {
    newStreak = 1;
  } else {
    const last = new Date(state.last_activity_date);
    const diffDays = Math.floor(
      (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 1) {
      newStreak = state.current_streak + 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
  }

  const longestStreak = Math.max(state.longest_streak, newStreak);
  const badgeCandidates = checkBadges({
    ...state,
    current_streak: newStreak,
    longest_streak: longestStreak,
    total_xp: totalXp,
  });
  const badges = Array.from(new Set([...(state.badges || []), ...badgeCandidates]));

  await supabaseServer
    .from("user_gamification")
    .update({
      current_streak: newStreak,
      longest_streak: longestStreak,
      total_xp: totalXp,
      level: newLevel,
      badges,
      last_activity_date: todayStr,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", USER_ID);

  return {
    xpEarned,
    streak: newStreak,
    longestStreak,
    totalXp,
    level: newLevel,
    badges,
  };
}

export async function getGamificationOverview(): Promise<GamificationOverview> {
  const state = await getState();
  return {
    streak: state.current_streak,
    longestStreak: state.longest_streak,
    totalXp: state.total_xp,
    level: state.level,
    badges: state.badges,
  };
}

