"use client";

import { Clock, Target, TrendingUp } from "lucide-react";

export interface SessionLog {
    id: string;
    topic: string;
    created_at: string;
    time_block: number;
    understanding_score?: number;
    completion_rate?: number;
    energy: number;
}

export interface SessionLogCardProps {
    session: SessionLog;
    onClick: () => void;
}

export default function SessionLogCard({ session, onClick }: SessionLogCardProps) {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("sv-SE", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    const getScoreColor = (score?: number) => {
        if (!score) return "text-muted-foreground";
        if (score >= 4) return "text-green-500";
        if (score >= 3) return "text-yellow-500";
        return "text-red-500";
    };

    return (
        <button
            onClick={onClick}
            className="w-full text-left rounded-lg border border-border bg-card p-4 hover:border-primary/50 hover:bg-card/80 transition-all"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                        <h4 className="font-medium">{session.topic}</h4>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(session.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {session.time_block} min
                        </span>
                        {session.understanding_score && (
                            <span className={`flex items-center gap-1 ${getScoreColor(session.understanding_score)}`}>
                                <TrendingUp className="h-3 w-3" />
                                {session.understanding_score}/5
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                    {session.completion_rate !== undefined && (
                        <span className="text-xs font-medium text-muted-foreground">
                            {session.completion_rate}% done
                        </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                        Energy: {session.energy}/10
                    </span>
                </div>
            </div>
        </button>
    );
}
