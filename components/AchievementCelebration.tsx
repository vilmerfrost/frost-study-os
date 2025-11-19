"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Sparkles, Trophy, Zap, Target, Flame, Star } from 'lucide-react';

export type AchievementType = 
  | 'level_up'
  | 'streak_milestone'
  | 'mastery_100'
  | 'phase_complete'
  | 'badge_unlock'
  | 'daily_goal'
  | 'week_complete'
  | 'month_complete';

interface AchievementCelebrationProps {
  isVisible: boolean;
  type: AchievementType;
  title: string;
  message: string;
  xp?: number;
  badge?: string;
  onClose?: () => void;
}

const achievementConfig: Record<AchievementType, {
  icon: React.ReactNode;
  gradient: string;
  particles: number;
  duration: number;
}> = {
  level_up: {
    icon: <Zap className="w-20 h-20 text-yellow-400" />,
    gradient: 'from-yellow-400 via-orange-500 to-red-500',
    particles: 50,
    duration: 4000,
  },
  streak_milestone: {
    icon: <Flame className="w-20 h-20 text-orange-500" />,
    gradient: 'from-orange-400 via-red-500 to-pink-500',
    particles: 60,
    duration: 4500,
  },
  mastery_100: {
    icon: <Target className="w-20 h-20 text-green-400" />,
    gradient: 'from-green-400 via-emerald-500 to-teal-500',
    particles: 40,
    duration: 4000,
  },
  phase_complete: {
    icon: <Trophy className="w-20 h-20 text-purple-400" />,
    gradient: 'from-purple-400 via-pink-500 to-indigo-500',
    particles: 80,
    duration: 5000,
  },
  badge_unlock: {
    icon: <Star className="w-20 h-20 text-blue-400" />,
    gradient: 'from-blue-400 via-cyan-500 to-teal-500',
    particles: 30,
    duration: 3500,
  },
  daily_goal: {
    icon: <Sparkles className="w-20 h-20 text-cyan-400" />,
    gradient: 'from-cyan-400 via-blue-500 to-indigo-500',
    particles: 35,
    duration: 3000,
  },
  week_complete: {
    icon: <Trophy className="w-20 h-20 text-amber-400" />,
    gradient: 'from-amber-400 via-yellow-500 to-orange-500',
    particles: 45,
    duration: 4000,
  },
  month_complete: {
    icon: <Trophy className="w-20 h-20 text-violet-400" />,
    gradient: 'from-violet-400 via-purple-500 to-fuchsia-500',
    particles: 70,
    duration: 5000,
  },
};

export function AchievementCelebration({
  isVisible,
  type,
  title,
  message,
  xp,
  badge,
  onClose,
}: AchievementCelebrationProps) {
  const [show, setShow] = useState(isVisible);
  const config = achievementConfig[type];

  useEffect(() => {
    setShow(isVisible);
    if (isVisible) {
      const timer = setTimeout(() => {
        setShow(false);
        onClose?.();
      }, config.duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, config.duration, onClose]);

  // Generate random particles
  const particles = Array.from({ length: config.particles }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1.5,
  }));

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop with blur */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Animated gradient background */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-20`}
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Main celebration card */}
          <motion.div
            className="relative z-10 max-w-md w-full mx-4"
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{
              type: 'spring',
              damping: 15,
              stiffness: 200,
            }}
          >
            {/* Glowing card */}
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
              {/* Glow effect */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-30 rounded-3xl blur-2xl -z-10`}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Particles */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                {particles.map((particle) => (
                  <motion.div
                    key={particle.id}
                    className={`absolute w-2 h-2 bg-gradient-to-br ${config.gradient} rounded-full`}
                    style={{
                      left: `${particle.x}%`,
                      top: `${particle.y}%`,
                    }}
                    initial={{
                      scale: 0,
                      opacity: 0,
                      x: 0,
                      y: 0,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      x: (Math.random() - 0.5) * 200,
                      y: (Math.random() - 0.5) * 200,
                    }}
                    transition={{
                      duration: particle.duration,
                      delay: particle.delay,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </div>

              {/* Content */}
              <div className="relative z-10 text-center">
                {/* Icon with pulse animation */}
                <motion.div
                  className="flex justify-center mb-6"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  {config.icon}
                </motion.div>

                {/* Title */}
                <motion.h2
                  className={`text-4xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent mb-3`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {title}
                </motion.h2>

                {/* Message */}
                <motion.p
                  className="text-gray-700 text-lg mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {message}
                </motion.p>

                {/* XP Badge */}
                {xp && (
                  <motion.div
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r ${config.gradient} text-white font-bold text-lg shadow-lg mb-4`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.4,
                      type: 'spring',
                      stiffness: 200,
                    }}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>+{xp} XP</span>
                  </motion.div>
                )}

                {/* Badge name */}
                {badge && (
                  <motion.div
                    className="text-sm text-gray-600 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    🏆 {badge}
                  </motion.div>
                )}

                {/* Progress bar animation */}
                <motion.div
                  className="mt-6 h-1 bg-gray-200 rounded-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.div
                    className={`h-full bg-gradient-to-r ${config.gradient}`}
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1, delay: 0.7, ease: 'easeOut' }}
                  />
                </motion.div>
              </div>
            </div>

            {/* Outer glow rings */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r ${config.gradient} opacity-20`}
                style={{
                  padding: `${(i + 1) * 4}px`,
                  margin: `-${(i + 1) * 4}px`,
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 2 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

