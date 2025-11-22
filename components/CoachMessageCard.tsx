"use client";

import { Sparkles } from "lucide-react";
import VoiceMode from "./VoiceMode";

export interface CoachMessageCardProps {
    headline: string;
    message: string;
    toneTag: string;
    suggestedAction: string;
}

export default function CoachMessageCard({ headline, message, toneTag, suggestedAction }: CoachMessageCardProps) {
    const toneColors = {
        excited: "text-yellow-500 bg-yellow-500/10",
        supportive: "text-green-500 bg-green-500/10",
        challenging: "text-orange-500 bg-orange-500/10",
        reflective: "text-blue-500 bg-blue-500/10",
    };
    const toneColor = toneColors[toneTag as keyof typeof toneColors] || toneColors.supportive;

    return (
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-background p-8 shadow-lg">
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Future Vilmer säger</p>
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${toneColor}`}>
                            {toneTag}
                        </span>
                    </div>
                </div>
                <VoiceMode text={`${headline}. ${message}`} />
            </div>

            <h2 className="text-3xl font-bold mb-4">{headline}</h2>
            <p className="text-lg leading-relaxed text-foreground/90 mb-6">{message}</p>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-medium text-primary mb-1">Föreslagen åtgärd</p>
                <p className="text-sm text-foreground/90">{suggestedAction}</p>
            </div>
        </div>
    );
}
