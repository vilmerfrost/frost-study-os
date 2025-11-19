"use client";

import { useState, useCallback } from 'react';
import type { AchievementCheck } from '@/lib/achievements/checker';

export function useAchievements() {
  const [currentAchievement, setCurrentAchievement] = useState<AchievementCheck | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const triggerAchievement = useCallback((achievement: AchievementCheck) => {
    setCurrentAchievement(achievement);
    setIsVisible(true);
  }, []);

  const closeAchievement = useCallback(() => {
    setIsVisible(false);
    // Clear achievement after animation
    setTimeout(() => {
      setCurrentAchievement(null);
    }, 500);
  }, []);

  return {
    triggerAchievement,
    currentAchievement,
    isVisible,
    closeAchievement,
  };
}

