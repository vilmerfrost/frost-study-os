'use client';

import React, { useState } from 'react';
import { EnergyOrb } from './EnergyOrb';
import { Timeline } from './Timeline';
import { GlassCard } from './GlassCard';
import { ExportToCalendarButton } from './ExportToCalendarButton';
import { logEnergyAndGetState } from '@/app/actions/energy';
import { generateSchedule, GeneratedSchedule } from '@/app/actions/generate-schedule';
import { MorningBrief } from '@/app/actions/morning-brief';
import { DailyState } from '@/lib/types/frost-os';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Headphones, AlertTriangle, Zap } from 'lucide-react';

interface DashboardOrchestratorProps {
    userId: string;
    morningBrief: MorningBrief;
}

export const DashboardOrchestrator: React.FC<DashboardOrchestratorProps> = ({ userId, morningBrief }) => {
    const [energyLevel, setEnergyLevel] = useState<number>(3);
    const [hasLogged, setHasLogged] = useState(false);
    const [dailyState, setDailyState] = useState<DailyState | null>(null);
    const [schedule, setSchedule] = useState<GeneratedSchedule | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleLogEnergy = async () => {
        setIsGenerating(true);
        try {
            // 1. Log Energy & Get State (Reptilhjärnan)
            const state = await logEnergyAndGetState(energyLevel as 1 | 2 | 3 | 4 | 5);
            setDailyState(state);
            setHasLogged(true);

            // 2. Generate Schedule (Cortex)
            const newSchedule = await generateSchedule(
                state,
                energyLevel,
                morningBrief.phase,
                morningBrief.topic
            );
            setSchedule(newSchedule);
        } catch (error) {
            console.error("Error in flow:", error);
            alert("Something went wrong. Check console.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-4">

            {/* Header / Morning Brief (Bibliotekarien) */}
            <GlassCard className="relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="text-cyan-400 text-xs font-mono uppercase tracking-widest mb-1">
                            {morningBrief.phase} • Week {morningBrief.week}
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">{morningBrief.topic}</h1>
                        <p className="text-white/60 text-sm max-w-lg">
                            Ready for today's session? Log your energy to generate your personalized plan.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => alert("Audio player coming soon!")}
                            className="group flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/10 transition-all rounded-full pl-2 pr-6 py-2 backdrop-blur-md"
                        >
                            <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)] group-hover:scale-105 transition-transform">
                                <Play className="w-4 h-4 text-white fill-current" />
                            </div>
                            <div className="text-left">
                                <div className="text-[10px] text-white/40 uppercase tracking-wider">Morning Brief</div>
                                <div className="text-sm font-medium text-white">Start Audio</div>
                            </div>
                        </button>

                        <ExportToCalendarButton schedule={schedule} />
                    </div>
                </div>
            </GlassCard>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Left Col: Energy & Status */}
                <div className="space-y-6">
                    <GlassCard title="Reptilhjärnan Status">
                        <div className="flex flex-col items-center py-8">
                            <EnergyOrb level={energyLevel} />

                            {!hasLogged ? (
                                <div className="mt-8 w-full space-y-4">
                                    <div className="flex justify-between px-2">
                                        {[1, 2, 3, 4, 5].map((l) => (
                                            <button
                                                key={l}
                                                onClick={() => setEnergyLevel(l)}
                                                className={`
                          w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all
                          ${energyLevel === l
                                                        ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] scale-110'
                                                        : 'bg-white/5 text-white/40 hover:bg-white/10'}
                        `}
                                            >
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleLogEnergy}
                                        disabled={isGenerating}
                                        className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold text-white shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isGenerating ? 'Analyzing...' : 'Log Energy & Generate Plan'}
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-8 text-center space-y-2">
                                    <div className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-full border
                    ${dailyState?.mode === 'FORCED_RECOVERY' ? 'bg-red-500/20 border-red-500/50 text-red-200' :
                                            dailyState?.mode === 'INTERVENTION' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200' :
                                                'bg-green-500/20 border-green-500/50 text-green-200'}
                  `}>
                                        {dailyState?.mode === 'FORCED_RECOVERY' && <AlertTriangle className="w-4 h-4" />}
                                        <span className="font-mono font-bold">{dailyState?.mode}</span>
                                    </div>
                                    <p className="text-white/60 text-sm">{dailyState?.message}</p>
                                </div>
                            )}
                        </div>
                    </GlassCard>

                    {/* Resources (Bibliotekarien) */}
                    {hasLogged && (
                        <GlassCard title="Bibliotekarien Resources">
                            <div className="space-y-4">
                                {morningBrief.resources.map((res, i) => (
                                    <a
                                        key={i}
                                        href={res.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-cyan-400 font-mono">{res.source}</span>
                                            <ArrowUpRight className="w-3 h-3 text-white/20 group-hover:text-white/60" />
                                        </div>
                                        <h4 className="text-white font-medium mb-1">{res.title}</h4>
                                        <p className="text-xs text-white/40 line-clamp-2">{res.snippet}</p>
                                    </a>
                                ))}
                            </div>
                        </GlassCard>
                    )}
                </div>

                {/* Right Col: Cortex Schedule */}
                <div className="space-y-6">
                    <AnimatePresence mode="wait">
                        {schedule ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <GlassCard title="Cortex Plan" className="min-h-[600px]">
                                    <Timeline schedule={schedule} />
                                </GlassCard>
                            </motion.div>
                        ) : (
                            <GlassCard className="min-h-[600px] flex items-center justify-center text-center p-12">
                                <div className="space-y-4 max-w-xs mx-auto">
                                    <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center">
                                        <Zap className="w-8 h-8 text-white/20" />
                                    </div>
                                    <h3 className="text-xl font-medium text-white/40">Awaiting Input</h3>
                                    <p className="text-sm text-white/20">
                                        Log your energy level to activate the Cortex planner.
                                    </p>
                                </div>
                            </GlassCard>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

// Helper icon
function ArrowUpRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M7 7h10v10" />
            <path d="M7 17 17 7" />
        </svg>
    );
}
