'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { GeneratedSchedule } from '@/app/actions/generate-schedule';
import { generateICS, downloadICS } from '@/lib/utils/ics';

interface ExportToCalendarButtonProps {
    schedule: GeneratedSchedule | null;
}

export const ExportToCalendarButton: React.FC<ExportToCalendarButtonProps> = ({ schedule }) => {
    const handleExport = () => {
        if (!schedule) return;

        // Convert the schedule format to ICS format
        const icsSchedule = {
            blocks: schedule.schedule.map(block => ({
                time: block.startTime,
                type: block.type,
                task: block.activity,
                duration: calculateDuration(block.startTime, block.endTime),
            })),
            date: new Date(),
        };

        const icsContent = generateICS(icsSchedule);
        const today = new Date().toISOString().split('T')[0];
        downloadICS(icsContent, `frost-study-plan-${today}.ics`);
    };

    // Helper to calculate duration in minutes
    const calculateDuration = (start: string, end: string): number => {
        const [startHour, startMin] = start.split(':').map(Number);
        const [endHour, endMin] = end.split(':').map(Number);
        return (endHour * 60 + endMin) - (startHour * 60 + startMin);
    };

    if (!schedule) return null;

    return (
        <button
            onClick={handleExport}
            className="group flex items-center gap-3 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-600/30 hover:to-blue-600/30 border border-cyan-500/30 hover:border-cyan-500/50 transition-all rounded-xl px-4 py-3 backdrop-blur-md w-full"
        >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5 text-white" />
            </div>
            <div className="text-left flex-1">
                <div className="text-[10px] text-white/40 uppercase tracking-wider">Export</div>
                <div className="text-sm font-medium text-white">Add to Calendar</div>
            </div>
            <div className="text-xs text-cyan-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                .ics
            </div>
        </button>
    );
};
