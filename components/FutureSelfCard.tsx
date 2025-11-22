"use client";

import { Rocket } from "lucide-react";

export interface FutureSelfCardProps {
    weeklyMission: string;
}

export default function FutureSelfCard({ weeklyMission }: FutureSelfCardProps) {
    return (
        <div className="rounded-xl border border-accent/30 bg-gradient-to-br from-accent/10 to-card p-6 space-y-4">
            <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-accent" />
                <h3 className="font-semibold">Veckans Uppdrag från Future Vilmer</h3>
            </div>

            <p className="text-lg leading-relaxed">{weeklyMission}</p>

            <div className="pt-4 border-t border-border/30">
                <p className="text-xs text-muted-foreground italic">
                    "Du är kapabel till så mycket mer än du tror. Fortsätt bygga, fortsätt lära, fortsätt växa."
                </p>
            </div>
        </div>
    );
}
