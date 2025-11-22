"use client";

import { useState } from "react";
import { Activity, Moon, Heart, TrendingUp } from "lucide-react";
import { supabaseServer } from "@/lib/supabaseServer";

export interface EnergySnapshotProps {
    userId: string;
    onSave?: () => void;
}

export default function EnergySnapshot({ userId, onSave }: EnergySnapshotProps) {
    const [energy, setEnergy] = useState(7);
    const [sleepHours, setSleepHours] = useState(7.5);
    const [stressLevel, setStressLevel] = useState(3);
    const [notes, setNotes] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { saveEnergySnapshot } = await import("@/app/actions/database");
            const result = await saveEnergySnapshot(userId, energy, sleepHours, stressLevel, notes);

            if (result.success) {
                onSave?.();
            } else {
                console.error("Failed to save:", result.error);
            }
        } catch (error) {
            console.error("Failed to save energy snapshot:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Energy Snapshot
                </h3>
                <span className="text-xs text-muted-foreground">Today</span>
            </div>

            <div className="space-y-4">
                {/* Energy */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-3 w-3" />
                            Energy Level
                        </label>
                        <span className="text-sm font-mono font-bold">{energy}/10</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={energy}
                        onChange={(e) => setEnergy(parseInt(e.target.value))}
                        className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Drained</span>
                        <span>Excellent</span>
                    </div>
                </div>

                {/* Sleep */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Moon className="h-3 w-3" />
                            Sleep Last Night
                        </label>
                        <span className="text-sm font-mono font-bold">{sleepHours}h</span>
                    </div>
                    <input
                        type="range"
                        min="3"
                        max="12"
                        step="0.5"
                        value={sleepHours}
                        onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                        className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>3h</span>
                        <span>12h</span>
                    </div>
                </div>

                {/* Stress */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Heart className="h-3 w-3" />
                            Stress Level
                        </label>
                        <span className="text-sm font-mono font-bold">{stressLevel}/10</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={stressLevel}
                        onChange={(e) => setStressLevel(parseInt(e.target.value))}
                        className="w-full accent-destructive h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Calm</span>
                        <span>Stressed</span>
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Quick Note</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="How are you feeling today? (optional)"
                        className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
                {isSaving ? "Saving..." : "Save Snapshot"}
            </button>
        </div>
    );
}
