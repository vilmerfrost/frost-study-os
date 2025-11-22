"use client";

import { useState } from "react";
import { Sun, Moon } from "lucide-react";

export interface ReflectionFormProps {
    type: "morning" | "evening";
    userId: string;
    onSubmit?: (data: { content: string; energyBefore: number; energyAfter?: number }) => void;
}

export default function ReflectionForm({ type, userId, onSubmit }: ReflectionFormProps) {
    const [content, setContent] = useState("");
    const [energyBefore, setEnergyBefore] = useState(7);
    const [energyAfter, setEnergyAfter] = useState(7);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const { saveReflection } = await import("@/app/actions/database");
            const result = await saveReflection(
                userId,
                type,
                content,
                energyBefore,
                type === "evening" ? energyAfter : undefined
            );

            if (result.success) {
                onSubmit?.({
                    content,
                    energyBefore,
                    energyAfter: type === "evening" ? energyAfter : undefined,
                });
                setContent("");
            }
        } catch (error) {
            console.error("Failed to save reflection:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const Icon = type === "morning" ? Sun : Moon;
    const title = type === "morning" ? "Morgenreflektion" : "Kvällsreflektion";
    const placeholder = type === "morning"
        ? "Hur känner du dig inför dagen? Vad är målet?"
        : "Hur gick dagen? Vad lärde du dig?";

    return (
        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">{title}</h3>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium mb-2 block">
                        Hur känner du dig {type === "morning" ? "nu" : "efter dagen"}?
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={energyBefore}
                            onChange={(e) => setEnergyBefore(parseInt(e.target.value))}
                            className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="w-8 text-center font-mono font-bold">{energyBefore}</span>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium mb-2 block">Reflektion</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={placeholder}
                        required
                        className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </div>

                {type === "evening" && (
                    <div>
                        <label className="text-sm font-medium mb-2 block">Energi efter sessionen</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={energyAfter}
                                onChange={(e) => setEnergyAfter(parseInt(e.target.value))}
                                className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="w-8 text-center font-mono font-bold">{energyAfter}</span>
                        </div>
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={isSaving}
                className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
                {isSaving ? "Sparar..." : "Spara reflektion"}
            </button>
        </form>
    );
}
