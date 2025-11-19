"use client";

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FrostCardProps {
  children: ReactNode;
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

export function FrostCard({ children, hover = true, className = '', onClick }: FrostCardProps) {
  return (
    <motion.div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/5 backdrop-blur-xl
        border border-white/10
        shadow-lg shadow-black/20
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      whileHover={hover ? { 
        scale: 1.01,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      } : {}}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* Gradient overlay (subtle) */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

