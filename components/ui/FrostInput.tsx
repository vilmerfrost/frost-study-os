"use client";

import { motion } from 'framer-motion';
import { InputHTMLAttributes } from 'react';

interface FrostInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function FrostInput({ label, error, ...props }: FrostInputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-white/70">
          {label}
        </label>
      )}

      <input
        {...props}
        className={`
          w-full px-4 py-3 rounded-xl
          bg-white/5 backdrop-blur-sm
          border ${error ? 'border-red-500/50' : 'border-white/10'}
          text-white placeholder:text-white/30
          focus:outline-none focus:border-white/30
          focus:ring-2 focus:ring-blue-500/20
          transition-all
          ${props.className || ''}
        `}
      />

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

