"use client";

import { CheckCircle, Circle, Lock } from "lucide-react";

export interface YearDay {
    day_index: number;
    title: string;
    type: string;
    focus_area: string;
    module_id: string;
}

export interface YearDayCardProps {
    day: YearDay;
    isCompleted?: boolean;
    isCurrent?: boolean;
    isLocked?: boolean;
    onClick: () => void;
}

export default function YearDayCard({ day, isCompleted, isCurrent, isLocked, onClick }: YearDayCardProps) {
    const typeColors = {
        learn: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        practice: "bg-green-500/10 text-green-500 border-green-500/20",
        review: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        project: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        checkpoint: "bg-orange-500/10 text-orange-500 border-orange-500/20",
        rest: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    };

    const borderColor = isCurrent
        ? "border-primary bg-primary/5"
        : isCompleted
            ? "border-green-500/50 bg-green-500/5"
            : "border-border bg-card";

    return (
        <button
            onClick={onClick}
            disabled={isLocked}
            className={`group relative rounded-lg border p-4 text-left transition-all hover:shadow-md ${borderColor} ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/50"
                }`}
        >
            {/* Day Number Badge */}
            <div className="absolute top-2 right-2 flex items-center gap-1">
                {isCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                ) : isCurrent ? (
                    <Circle className="h-4 w-4 text-primary fill-primary" />
                ) : isLocked ? (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                )}
            </div>

            <div className="space-y-2">
                {/* Day Index */}
                <div className="text-xs font-medium text-muted-foreground">Day {day.day_index}</div>

                {/* Type Badge */}
                <div>
                    <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${typeColors[day.type as keyof typeof typeColors] || typeColors.learn
                            }`}
                    >
                        {day.type}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold line-clamp-2 min-h-[2.5rem]">{day.title}</h3>

                {/* Focus Area */}
                <p className="text-xs text-muted-foreground line-clamp-1">{day.focus_area}</p>
            </div>

            {isCurrent && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent rounded-b-lg" />
            )}
        </button>
    );
}
