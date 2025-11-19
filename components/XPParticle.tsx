"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface XPParticleProps {
  xp: number;
  onComplete?: () => void;
}

/**
 * Animated XP particle that flies from source to target.
 * Used when session is completed to show XP gain.
 */
export default function XPParticle({ xp, onComplete }: XPParticleProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ 
        x: 0, 
        y: 0, 
        opacity: 1, 
        scale: 0.8 
      }}
      animate={{ 
        x: [0, -50, -100],
        y: [0, -80, -150],
        opacity: [1, 1, 0],
        scale: [0.8, 1.2, 0.5]
      }}
      transition={{ 
        duration: 2,
        ease: "easeOut"
      }}
      className="fixed pointer-events-none z-50"
      style={{
        left: "50%",
        top: "50%",
      }}
    >
      <div className="text-2xl font-bold text-yellow-400 drop-shadow-lg">
        +{xp} XP
      </div>
    </motion.div>
  );
}

