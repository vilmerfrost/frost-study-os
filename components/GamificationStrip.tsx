"use client";

import { motion, AnimatePresence } from "framer-motion";

interface GamificationStripProps {
  streak: number;
  level: number;
  totalXp: number;
  recentBadge?: string | null;
  highlight?: boolean;
}

export default function GamificationStrip({
  streak,
  level,
  totalXp,
  recentBadge,
  highlight = false,
}: GamificationStripProps) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/70 backdrop-blur px-4 py-3 shadow-sm flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 text-xs sm:text-sm">
        <AnimatePresence>
          <motion.span
            key={`streak-${streak}`}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className="font-semibold text-orange-500"
          >
            🔥 Streak: {streak}d
          </motion.span>
        </AnimatePresence>
        <motion.span
          animate={{ scale: highlight ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 0.8 }}
          className="font-semibold text-sky-500"
        >
          🛡 Level {level}
        </motion.span>
        <span className="text-slate-500 dark:text-slate-300">XP: {totalXp}</span>
      </div>
      <AnimatePresence>
        {recentBadge && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="text-xs font-semibold text-emerald-400"
          >
            🏅 {recentBadge}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

