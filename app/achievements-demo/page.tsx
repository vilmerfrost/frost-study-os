"use client";

import { useState } from 'react';
import { useAchievements } from '@/hooks/useAchievements';
import { AchievementCelebration } from '@/components/AchievementCelebration';
import { ContentCard } from '@/components/ui/ContentCard';
import { Button } from '@/components/ui/FrostButton';
import type { AchievementType } from '@/components/AchievementCelebration';

const achievementTypes: Array<{
  type: AchievementType;
  title: string;
  message: string;
  xp?: number;
  badge?: string;
}> = [
  {
    type: 'level_up',
    title: 'Level 10 Unlocked! 🎉',
    message: "You've reached level 10! Keep pushing forward!",
    xp: 0,
  },
  {
    type: 'streak_milestone',
    title: '30 Day Streak! 🔥',
    message: 'A full month! You\'re unstoppable! 🚀',
    xp: 300,
  },
  {
    type: 'mastery_100',
    title: 'Perfect Mastery! 🎯',
    message: "You've mastered Eigenvectors! You're a true expert!",
    xp: 500,
    badge: 'Master',
  },
  {
    type: 'phase_complete',
    title: 'Phase 1 Complete! 🏆',
    message: "You've completed Phase 1: Foundations! Incredible work!",
    xp: 2000,
    badge: 'Phase 1 Champion',
  },
  {
    type: 'badge_unlock',
    title: 'New Badge Unlocked! ⭐',
    message: "You've earned the 'Consistency King' badge!",
    xp: 250,
    badge: 'Consistency King',
  },
  {
    type: 'daily_goal',
    title: 'Daily Goal Achieved! ✨',
    message: "You've completed 3 sessions today! Amazing dedication!",
    xp: 100,
  },
  {
    type: 'week_complete',
    title: 'Week Complete! 🎊',
    message: "You've completed week 5 with 25 hours of deep work!",
    xp: 500,
  },
  {
    type: 'month_complete',
    title: 'Month Complete! 🌟',
    message: "You've completed month 2 with 90 hours! You're incredible!",
    xp: 1500,
  },
];

export default function AchievementsDemoPage() {
  const { triggerAchievement, currentAchievement, isVisible: achievementVisible, closeAchievement } = useAchievements();
  const [lastTriggered, setLastTriggered] = useState<string | null>(null);

  const handleTrigger = (achievement: typeof achievementTypes[0]) => {
    triggerAchievement(achievement);
    setLastTriggered(achievement.type);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎉 Achievement Celebration Demo
          </h1>
          <p className="text-gray-600">
            Test all the WOW achievement celebrations! Click any button to see the magic ✨
          </p>
        </div>

        <ContentCard title="Achievement Types">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievementTypes.map((achievement) => (
              <Button
                key={achievement.type}
                variant="primary"
                onClick={() => handleTrigger(achievement)}
                className="w-full text-left justify-start"
              >
                <div className="flex flex-col">
                  <span className="font-semibold">{achievement.title}</span>
                  <span className="text-sm opacity-90">{achievement.type}</span>
                </div>
              </Button>
            ))}
          </div>
        </ContentCard>

        {lastTriggered && (
          <ContentCard>
            <p className="text-gray-600">
              Last triggered: <span className="font-semibold">{lastTriggered}</span>
            </p>
          </ContentCard>
        )}

        <ContentCard title="How It Works">
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>🎯 Automatic Detection:</strong> Achievements are automatically checked
              after each session completion.
            </p>
            <p>
              <strong>🔥 Triggers:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Level up</li>
              <li>Streak milestones (7, 14, 30, 50, 100, 200, 365 days)</li>
              <li>100% mastery on a topic</li>
              <li>Phase completion</li>
              <li>Badge unlocks</li>
              <li>Daily goal completion</li>
              <li>Week/month completion</li>
            </ul>
            <p className="mt-4">
              <strong>✨ Features:</strong> Confetti particles, glowing effects, smooth
              animations, gradient backgrounds, and AI-generated celebration messages!
            </p>
          </div>
        </ContentCard>
      </div>

      {/* Achievement Component */}
      {currentAchievement && (
        <AchievementCelebration
          isVisible={achievementVisible}
          type={currentAchievement.type}
          title={currentAchievement.title}
          message={currentAchievement.message}
          xp={currentAchievement.xp}
          badge={currentAchievement.badge}
          onClose={closeAchievement}
        />
      )}
    </div>
  );
}

