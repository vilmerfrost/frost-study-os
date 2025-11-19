// Note: This file should only be used server-side
// For client-side usage, use /api/achievements/check
import { supabaseServer } from '@/lib/supabaseServer';
import type { AchievementType } from '@/components/AchievementCelebration';

export interface AchievementCheck {
  type: AchievementType;
  title: string;
  message: string;
  xp?: number;
  badge?: string;
}

const USER_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Check for level up achievement
 */
export async function checkLevelUp(
  previousLevel: number,
  currentLevel: number
): Promise<AchievementCheck | null> {
  if (currentLevel > previousLevel) {
    return {
      type: 'level_up',
      title: `Level ${currentLevel} Unlocked! 🎉`,
      message: `You've reached level ${currentLevel}! Keep pushing forward!`,
      xp: 0, // Level up doesn't give XP, it's the result of XP
    };
  }
  return null;
}

/**
 * Check for streak milestones
 */
export async function checkStreakMilestone(
  currentStreak: number
): Promise<AchievementCheck | null> {
  const milestones = [7, 14, 30, 50, 100, 200, 365];
  const milestone = milestones.find((m) => currentStreak === m);

  if (milestone) {
    const messages: Record<number, string> = {
      7: 'One week strong! You\'re building a habit! 🔥',
      14: 'Two weeks! You\'re on fire! 💪',
      30: 'A full month! You\'re unstoppable! 🚀',
      50: '50 days! You\'re a learning machine! ⚡',
      100: '100 DAYS! You\'re a legend! 👑',
      200: '200 DAYS! You\'re incredible! 🌟',
      365: 'A FULL YEAR! You\'re absolutely amazing! 🏆',
    };

    return {
      type: 'streak_milestone',
      title: `${milestone} Day Streak! 🔥`,
      message: messages[milestone] || `Amazing ${milestone} day streak!`,
      xp: milestone * 10, // More XP for longer streaks
    };
  }
  return null;
}

/**
 * Check for 100% mastery achievement
 */
export async function checkMastery100(
  topicName: string,
  topicId: string
): Promise<AchievementCheck | null> {
  // Check if topic reached 100% mastery
  const { data: topic } = await supabaseServer
    .from('topics')
    .select('mastery_score, name')
    .eq('id', topicId)
    .single();

  if (topic && topic.mastery_score === 100) {
    return {
      type: 'mastery_100',
      title: 'Perfect Mastery! 🎯',
      message: `You've mastered ${topicName}! You're a true expert!`,
      xp: 500,
      badge: 'Master',
    };
  }
  return null;
}

/**
 * Check for phase completion
 */
export async function checkPhaseComplete(
  phaseNumber: number,
  phaseName: string
): Promise<AchievementCheck | null> {
  const { data: phase } = await supabaseServer
    .from('phases')
    .select('status, progress_percentage')
    .eq('user_id', USER_ID)
    .eq('phase_number', phaseNumber)
    .single();

  if (phase && phase.status === 'completed' && phase.progress_percentage === 100) {
    return {
      type: 'phase_complete',
      title: `Phase ${phaseNumber} Complete! 🏆`,
      message: `You've completed ${phaseName}! Incredible work!`,
      xp: 2000,
      badge: `Phase ${phaseNumber} Champion`,
    };
  }
  return null;
}

/**
 * Check for badge unlocks
 */
export async function checkBadgeUnlock(
  previousBadges: string[],
  currentBadges: string[]
): Promise<AchievementCheck | null> {
  const newBadges = currentBadges.filter((b) => !previousBadges.includes(b));

  if (newBadges.length > 0) {
    const badge = newBadges[0]; // Show first new badge
    return {
      type: 'badge_unlock',
      title: 'New Badge Unlocked! ⭐',
      message: `You've earned the "${badge}" badge!`,
      xp: 250,
      badge,
    };
  }
  return null;
}

/**
 * Check for daily goal completion
 */
export async function checkDailyGoal(
  completedSessions: number,
  dailyGoal: number = 3
): Promise<AchievementCheck | null> {
  if (completedSessions >= dailyGoal) {
    return {
      type: 'daily_goal',
      title: 'Daily Goal Achieved! ✨',
      message: `You've completed ${completedSessions} sessions today! Amazing dedication!`,
      xp: 100,
    };
  }
  return null;
}

/**
 * Check for week completion
 */
export async function checkWeekComplete(
  weekNumber: number,
  totalHours: number
): Promise<AchievementCheck | null> {
  // Check if week is complete (all planned sessions done)
  if (totalHours >= 20) {
    return {
      type: 'week_complete',
      title: 'Week Complete! 🎊',
      message: `You've completed week ${weekNumber} with ${totalHours.toFixed(1)} hours of deep work!`,
      xp: 500,
    };
  }
  return null;
}

/**
 * Check for month completion
 */
export async function checkMonthComplete(
  monthNumber: number,
  totalHours: number
): Promise<AchievementCheck | null> {
  if (totalHours >= 80) {
    return {
      type: 'month_complete',
      title: 'Month Complete! 🌟',
      message: `You've completed month ${monthNumber} with ${totalHours.toFixed(1)} hours! You're incredible!`,
      xp: 1500,
    };
  }
  return null;
}

/**
 * Run all achievement checks after a session
 */
export async function checkAllAchievements(
  previousState: {
    level: number;
    streak: number;
    badges: string[];
  },
  currentState: {
    level: number;
    streak: number;
    badges: string[];
    topicId?: string;
    topicName?: string;
    completedSessions?: number;
  }
): Promise<AchievementCheck | null> {
  // Check level up
  const levelUp = await checkLevelUp(previousState.level, currentState.level);
  if (levelUp) return levelUp;

  // Check streak milestone
  const streak = await checkStreakMilestone(currentState.streak);
  if (streak) return streak;

  // Check badge unlock
  const badge = await checkBadgeUnlock(previousState.badges, currentState.badges);
  if (badge) return badge;

  // Check mastery 100
  if (currentState.topicId && currentState.topicName) {
    const mastery = await checkMastery100(currentState.topicName, currentState.topicId);
    if (mastery) return mastery;
  }

  // Check daily goal
  if (currentState.completedSessions) {
    const daily = await checkDailyGoal(currentState.completedSessions);
    if (daily) return daily;
  }

  return null;
}

