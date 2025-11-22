"use client";

import { X, Sparkles, ExternalLink } from "lucide-react";
import { type YearDay } from "./YearDayCard";

export interface DayPreviewModalProps {
    day: YearDay & {
        description?: string;
        objectives?: string[];
        resources?: string[];
        micro_tasks?: string[];
        estimated_hours?: number;
    };
    onClose: () => void;
    onGenerateDeepDive?: () => void;
    onMarkComplete?: () => void;
    onJumpToDay?: () => void;
}

export default function DayPreviewModal({
    day,
    onClose,
    onGenerateDeepDive,
    onMarkComplete,
    onJumpToDay,
}: DayPreviewModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-auto rounded-xl border border-border bg-card shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 backdrop-blur-sm p-6">
                    <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Day {day.day_index}</div>
                        <h2 className="text-2xl font-bold">{day.title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-md p-2 hover:bg-accent transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-3">
                        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary capitalize">
                            {day.type}
                        </span>
                        <span className="inline-block rounded-full bg-secondary px-3 py-1 text-sm font-medium">
                            {day.module_id}
                        </span>
                        {day.estimated_hours && (
                            <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
                                {day.estimated_hours}h estimated
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    {day.description && (
                        <div>
                            <h3 className="text-sm font-semibold mb-2">Description</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{day.description}</p>
                        </div>
                    )}

                    {/* Objectives */}
                    {day.objectives && day.objectives.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold mb-2">Learning Objectives</h3>
                            <ul className="space-y-2">
                                {day.objectives.map((obj, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                        <span className="text-primary mt-0.5">•</span>
                                        <span>{obj}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Micro Tasks */}
                    {day.micro_tasks && day.micro_tasks.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold mb-2">Micro Tasks</h3>
                            <div className="space-y-2">
                                {day.micro_tasks.map((task, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            className="rounded border-input"
                                            id={`task-${i}`}
                                        />
                                        <label htmlFor={`task-${i}`} className="text-sm cursor-pointer">
                                            {task}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Resources */}
                    {day.resources && day.resources.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold mb-2">Resources</h3>
                            <div className="space-y-2">
                                {day.resources.map((resource, i) => (
                                    <a
                                        key={i}
                                        href={resource}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                        <span>{resource}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="sticky bottom-0 border-t border-border bg-card/95 backdrop-blur-sm p-6">
                    <div className="flex flex-wrap gap-3">
                        {onGenerateDeepDive && (
                            <button
                                onClick={onGenerateDeepDive}
                                className="inline-flex items-center gap-2 rounded-md border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
                            >
                                <Sparkles className="h-4 w-4" />
                                Generate Deep Dive
                            </button>
                        )}
                        {onMarkComplete && (
                            <button
                                onClick={onMarkComplete}
                                className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                            >
                                Mark Complete
                            </button>
                        )}
                        {onJumpToDay && (
                            <button
                                onClick={onJumpToDay}
                                className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                Jump to This Day
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
