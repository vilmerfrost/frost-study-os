"use client";

import { useState } from "react";

export interface Phase {
    phase_number: number;
    title: string;
    focus_area: string;
    duration_days: number;
    start_day: number;
    end_day: number;
    description: string;
}

export interface PhaseNavigatorProps {
    phases: Phase[];
    currentPhase: number;
    onPhaseChange: (phase: number) => void;
}

export default function PhaseNavigator({ phases, currentPhase, onPhaseChange }: PhaseNavigatorProps) {
    return (
        <div className="rounded-xl border border-border bg-card p-2">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {phases.map((phase) => (
                    <button
                        key={phase.phase_number}
                        onClick={() => onPhaseChange(phase.phase_number)}
                        className={`rounded-lg p-4 text-left transition-all ${currentPhase === phase.phase_number
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "bg-card hover:bg-accent"
                            }`}
                    >
                        <div className="text-xs font-medium opacity-75">Phase {phase.phase_number}</div>
                        <div className="text-sm font-bold mt-1">{phase.title}</div>
                        <div className="text-xs opacity-75 mt-1">{phase.duration_days} days</div>
                    </button>
                ))}
            </div>
        </div>
    );
}
