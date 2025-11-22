"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface TopicMasteryProps {
    topics: {
        topic: string;
        mastery: number;
        change: number;
        sessions: number;
    }[];
}

export default function TopicMastery({ topics }: TopicMasteryProps) {
    if (!topics || topics.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-card p-6 text-center">
                <p className="text-sm text-muted-foreground">No topic data available</p>
            </div>
        );
    }

    const getMasteryColor = (mastery: number) => {
        if (mastery >= 75) return "text-green-500 bg-green-500/10";
        if (mastery >= 50) return "text-yellow-500 bg-yellow-500/10";
        return "text-red-500 bg-red-500/10";
    };

    const getTrendIcon = (change: number) => {
        if (change > 0) return <TrendingUp className="h-3 w-3 text-green-500" />;
        if (change < 0) return <TrendingDown className="h-3 w-3 text-red-500" />;
        return <Minus className="h-3 w-3 text-muted-foreground" />;
    };

    return (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Topic Mastery</h3>

            <div className="space-y-3">
                {topics.map((topic, i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{topic.topic}</span>
                                {getTrendIcon(topic.change)}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">{topic.sessions} sessions</span>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getMasteryColor(topic.mastery)}`}>
                                    {topic.mastery}%
                                </span>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
                            <div
                                className={`absolute top-0 left-0 h-full transition-all duration-500 ${topic.mastery >= 75 ? "bg-green-500" :
                                        topic.mastery >= 50 ? "bg-yellow-500" : "bg-red-500"
                                    }`}
                                style={{ width: `${topic.mastery}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
