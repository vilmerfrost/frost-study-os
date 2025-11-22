"use client";

export interface YearProgressProps {
    currentDay: number;
    totalDays?: number;
}

export default function YearProgress({ currentDay, totalDays = 365 }: YearProgressProps) {
    const progress = (currentDay / totalDays) * 100;
    const daysRemaining = totalDays - currentDay;

    return (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium">Year Progress</p>
                    <p className="text-2xl font-bold">{currentDay}/{totalDays}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground">Days remaining</p>
                    <p className="text-lg font-bold text-muted-foreground">{daysRemaining}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 rounded-full bg-secondary overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
                <span>Start</span>
                <span className="font-medium text-foreground">{Math.round(progress)}% Complete</span>
                <span>Mastery</span>
            </div>
        </div>
    );
}
