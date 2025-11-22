"use client";

import { Brain, Clock, Flame } from "lucide-react";
import Link from "next/link";

export interface SRSItem {
    id: string;
    topic: string;
    subtopic: string;
    difficulty: "easy" | "medium" | "hard";
    next_review_date: string;
}

export interface SRSDeckProps {
    items: SRSItem[];
    isLoading?: boolean;
}

export default function SRSDeck({ items, isLoading = false }: SRSDeckProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Due for Review</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-lg border border-border bg-card p-4 animate-pulse">
                            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                            <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-muted rounded w-full"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Due for Review</h2>
                <div className="rounded-xl border border-dashed border-border bg-card/30 p-8 text-center">
                    <Brain className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                        No reviews due today. Great work staying on top of your studies!
                    </p>
                </div>
            </div>
        );
    }

    const difficultyColors = {
        easy: "text-green-500 bg-green-500/10",
        medium: "text-yellow-500 bg-yellow-500/10",
        hard: "text-red-500 bg-red-500/10",
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Due for Review</h2>
                <Link
                    href="/reviews"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                    View all <Clock className="h-3 w-3" />
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.slice(0, 6).map((item) => (
                    <div
                        key={item.id}
                        className="group rounded-lg border border-border/40 bg-card/50 p-4 hover:bg-card hover:border-primary/30 transition-all cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-medium text-muted-foreground">{item.topic}</span>
                            <span
                                className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyColors[item.difficulty]
                                    }`}
                            >
                                {item.difficulty}
                            </span>
                        </div>
                        <h3 className="font-medium mb-2 line-clamp-2">{item.subtopic}</h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Flame className="h-3 w-3" />
                            <span>Review due today</span>
                        </div>
                    </div>
                ))}
            </div>

            {items.length > 6 && (
                <div className="text-center">
                    <Link
                        href="/reviews"
                        className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                        View all {items.length} reviews
                    </Link>
                </div>
            )}
        </div>
    );
}
