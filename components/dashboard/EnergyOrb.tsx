'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface EnergyOrbProps {
    level: number; // 1-5
}

export const EnergyOrb: React.FC<EnergyOrbProps> = ({ level }) => {
    // Calculate color and intensity based on level
    const getColor = (l: number) => {
        if (l <= 2) return '#EF4444'; // Red
        if (l === 3) return '#EAB308'; // Yellow
        return '#06B6D4'; // Cyan/Blue (Frost theme)
    };

    const color = getColor(level);
    const percentage = (level / 5) * 100;

    return (
        <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Core Orb */}
            <motion.div
                className="absolute w-48 h-48 rounded-full blur-md"
                style={{
                    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                    boxShadow: `0 0 60px ${color}40`
                }}
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.8, 1, 0.8],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Glossy Surface */}
            <div className="absolute w-48 h-48 rounded-full bg-gradient-to-b from-white/20 to-transparent backdrop-blur-sm border border-white/10 shadow-inner" />

            {/* Text Content */}
            <div className="relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-6xl font-bold text-white drop-shadow-lg font-mono"
                >
                    {percentage}%
                </motion.div>
                <div className="text-white/60 text-sm tracking-[0.2em] uppercase mt-2">Energy Level</div>
            </div>

            {/* Wave Animation (simplified) */}
            <svg className="absolute bottom-8 w-32 h-8 opacity-50" viewBox="0 0 100 20">
                <motion.path
                    d="M0 10 Q 25 20 50 10 T 100 10"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    animate={{ d: ["M0 10 Q 25 20 50 10 T 100 10", "M0 10 Q 25 0 50 10 T 100 10", "M0 10 Q 25 20 50 10 T 100 10"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
            </svg>
        </div>
    );
};
