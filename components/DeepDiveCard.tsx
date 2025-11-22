"use client";

import { Sparkles, ArrowRight } from "lucide-react";

export interface DeepDiveCardProps {
    whyItMatters: string;
    keyInsights: string[];
    connectionsToPrevious: string;
    isLoading?: boolean;
}

export default function DeepDiveCard({
    whyItMatters,
    keyInsights,
    connectionsToPrevious,
    isLoading = false,
}: DeepDiveCardProps) {
    if (isLoading) {
        return (
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    <h3 className="font-semibold">AI Deep Dive</h3>
                </div>
                <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-card p-6 space-y-4">
            <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Varför det här spelar roll</h3>
            </div>

            <div className="space-y-4">
                {/* Why It Matters */}
                <p className="text-sm leading-relaxed">{whyItMatters}</p>

                {/* Key Insights */}
                {keyInsights && keyInsights.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Nyckelinsikter
                        </p>
                        <ul className="space-y-2">
                            {keyInsights.map((insight, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                    <ArrowRight className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                    <span>{insight}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Connections */}
                {connectionsToPrevious && (
                    <div className="pt-3 border-t border-border/30">
                        <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Kopplingar:</span> {connectionsToPrevious}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
