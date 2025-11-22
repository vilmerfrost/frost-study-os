"use client";

import { X, Calendar, Clock, Zap, Target, FileText } from "lucide-react";
import { type SessionLog } from "./SessionLogCard";

export interface SessionDetailModalProps {
    session: SessionLog & {
        reflection?: string;
        plan?: any;
    };
    onClose: () => void;
}

export default function SessionDetailModal({ session, onClose }: SessionDetailModalProps) {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString("sv-SE", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-auto rounded-xl border border-border bg-card shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 backdrop-blur-sm p-6">
                    <div>
                        <h2 className="text-2xl font-bold">{session.topic}</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            <Calendar className="inline h-3 w-3 mr-1" />
                            {formatDate(session.created_at)}
                        </p>
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
                    {/* Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>Duration</span>
                            </div>
                            <p className="text-2xl font-bold">{session.time_block}m</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Zap className="h-3 w-3" />
                                <span>Energy</span>
                            </div>
                            <p className="text-2xl font-bold">{session.energy}/10</p>
                        </div>

                        {session.understanding_score && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Target className="h-3 w-3" />
                                    <span>Understanding</span>
                                </div>
                                <p className="text-2xl font-bold">{session.understanding_score}/5</p>
                            </div>
                        )}

                        {session.completion_rate !== undefined && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <FileText className="h-3 w-3" />
                                    <span>Completion</span>
                                </div>
                                <p className="text-2xl font-bold">{session.completion_rate}%</p>
                            </div>
                        )}
                    </div>

                    {/* Plan Blocks */}
                    {session.plan?.blocks && (
                        <div>
                            <h3 className="text-sm font-semibold mb-3">Study Plan</h3>
                            <div className="space-y-2">
                                {session.plan.blocks.map((block: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50">
                                        <span className="text-xs font-medium text-muted-foreground w-16">
                                            {block.duration}m
                                        </span>
                                        <div className="flex-1">
                                            <span className="text-xs font-medium text-primary">{block.type}</span>
                                            <p className="text-sm">{block.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reflection */}
                    {session.reflection && (
                        <div>
                            <h3 className="text-sm font-semibold mb-2">Reflection</h3>
                            <div className="rounded-lg border border-border bg-secondary/20 p-4">
                                <p className="text-sm leading-relaxed">{session.reflection}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
