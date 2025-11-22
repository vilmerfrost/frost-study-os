'use client';

import React from 'react';
import { GeneratedSchedule } from '@/app/actions/generate-schedule';
import { motion } from 'framer-motion';
import { Clock, BookOpen, Zap, Coffee, Music } from 'lucide-react';

interface TimelineProps {
    schedule: GeneratedSchedule;
}

export const Timeline: React.FC<TimelineProps> = ({ schedule }) => {
    const getIcon = (type: string) => {
        switch (type) {
            case 'DEEP_WORK': return <Zap className="w-5 h-5 text-cyan-400" />;
            case 'LIGHT_WORK': return <BookOpen className="w-5 h-5 text-blue-300" />;
            case 'BREAK': return <Coffee className="w-5 h-5 text-yellow-400" />;
            case 'HUMAN_TIME': return <Music className="w-5 h-5 text-pink-400" />;
            default: return <Clock className="w-5 h-5 text-gray-400" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-white/80 italic text-sm border-l-2 border-cyan-500/50 pl-4 py-1">
                "{schedule.summary}"
            </div>

            <div className="relative border-l border-white/10 ml-3 space-y-8 py-2">
                {schedule.schedule.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative pl-8"
                    >
                        {/* Dot */}
                        <div className="absolute -left-[5px] top-1 w-[10px] h-[10px] rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />

                        {/* Content */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 group">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-mono text-cyan-300 bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-900/50">
                                        {item.startTime} - {item.endTime}
                                    </span>
                                    <span className="text-xs text-white/40 uppercase tracking-wider border border-white/10 px-2 py-0.5 rounded-full">
                                        {item.type.replace('_', ' ')}
                                    </span>
                                </div>

                                <h4 className="text-lg font-medium text-white group-hover:text-cyan-200 transition-colors">
                                    {item.activity}
                                </h4>

                                <p className="text-sm text-white/60 mt-1">
                                    {item.description}
                                </p>

                                {item.resources && item.resources.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {item.resources.map((res, i) => (
                                            <span key={i} className="text-xs text-blue-400 underline cursor-pointer hover:text-blue-300">
                                                {res}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-2 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors">
                                {getIcon(item.type)}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
