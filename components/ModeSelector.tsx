"use client";

export interface ModeSelectorProps {
    currentMode: "beast" | "balanced" | "recovery" | "soft";
    onChange: (mode: "beast" | "balanced" | "recovery" | "soft") => void;
}

export default function ModeSelector({ currentMode, onChange }: ModeSelectorProps) {
    const modes = [
        { id: "beast" as const, label: "Beast", color: "bg-red-500/10 text-red-500 border-red-500/20" },
        { id: "balanced" as const, label: "Balanced", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
        { id: "recovery" as const, label: "Recovery", color: "bg-green-500/10 text-green-500 border-green-500/20" },
        { id: "soft" as const, label: "Soft", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
    ];

    return (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold">Välj läge</h3>

            <div className="grid grid-cols-2 gap-3">
                {modes.map((mode) => (
                    <button
                        key={mode.id}
                        onClick={() => onChange(mode.id)}
                        className={`rounded-lg border p-4 text-center transition-all ${currentMode === mode.id
                                ? `${mode.color} border-2`
                                : "border-border bg-card/50 hover:bg-accent"
                            }`}
                    >
                        <div className="font-semibold">{mode.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            {mode.id === "beast" && "Intensiv, maximal output"}
                            {mode.id === "balanced" && "Bra balans, hållbart"}
                            {mode.id === "recovery" && "Lätt, återhämtning"}
                            {mode.id === "soft" && "Minimal belastning"}
                        </div>
                    </button>
                ))}
            </div>

            <p className="text-xs text-muted-foreground">
                Ditt valda läge påverkar AI-genererade planer och rekommendationer.
            </p>
        </div>
    );
}
