import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import {
  checkLevelUp,
  checkStreakMilestone,
  checkMastery100,
  checkPhaseComplete,
  checkBadgeUnlock,
  checkDailyGoal,
  type AchievementCheck,
} from '@/lib/achievements/checker';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      previousState,
      currentState,
    }: {
      previousState: {
        level: number;
        streak: number;
        badges: string[];
      };
      currentState: {
        level: number;
        streak: number;
        badges: string[];
        topicId?: string;
        topicName?: string;
        completedSessions?: number;
      };
    } = body;

    // Check level up
    const levelUp = await checkLevelUp(previousState.level, currentState.level);
    if (levelUp) {
      return NextResponse.json({ achievement: levelUp });
    }

    // Check streak milestone
    const streak = await checkStreakMilestone(currentState.streak);
    if (streak) {
      return NextResponse.json({ achievement: streak });
    }

    // Check badge unlock
    const badge = await checkBadgeUnlock(previousState.badges, currentState.badges);
    if (badge) {
      return NextResponse.json({ achievement: badge });
    }

    // Check mastery 100
    if (currentState.topicId && currentState.topicName) {
      const mastery = await checkMastery100(currentState.topicName, currentState.topicId);
      if (mastery) {
        return NextResponse.json({ achievement: mastery });
      }
    }

    // Check daily goal
    if (currentState.completedSessions) {
      const daily = await checkDailyGoal(currentState.completedSessions);
      if (daily) {
        return NextResponse.json({ achievement: daily });
      }
    }

    return NextResponse.json({ achievement: null });
  } catch (error: any) {
    console.error('Achievement check error:', error);
    return NextResponse.json(
      { error: 'Failed to check achievements', details: error.message },
      { status: 500 }
    );
  }
}

