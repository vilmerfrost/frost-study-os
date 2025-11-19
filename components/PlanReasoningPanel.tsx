"use client";

import { useState } from "react";
import type { PlanReasoning, DayType } from "@/lib/plan/types";

interface PlanReasoningPanelProps {
  reasoning: PlanReasoning;
  currentDayType?: DayType;
  onOverride?: (newDayType: DayType, reason?: string) => void;
}

export default function PlanReasoningPanel({
  reasoning,
  currentDayType,
  onOverride,
}: PlanReasoningPanelProps) {
  const [showOverride, setShowOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");

  const handleOverride = (newDayType: DayType) => {
    if (onOverride) {
      onOverride(newDayType, overrideReason || undefined);
      setShowOverride(false);
      setOverrideReason("");
    }
  };

  return (
    <div className="mb-6 rounded-lg border border-cyan-500/20 bg-gradient-to-br from-cyan-950/30 to-blue-950/30 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-cyan-200">Varför denna plan?</h3>
        {onOverride && (
          <button
            onClick={() => setShowOverride(!showOverride)}
            className="text-sm text-cyan-400 hover:text-cyan-300"
          >
            {showOverride ? "Avbryt" : "Överskriv"}
          </button>
        )}
      </div>

      {showOverride && onOverride && (
        <div className="mb-4 space-y-2 rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-3">
          <p className="text-sm text-cyan-300">Överskriv dagstyp:</p>
          <div className="flex gap-2">
            {(["minimum", "normal", "beast", "recovery"] as DayType[]).map((dt) => (
              <button
                key={dt}
                onClick={() => handleOverride(dt)}
                className={`rounded px-3 py-1 text-sm ${
                  dt === currentDayType
                    ? "bg-cyan-500 text-white"
                    : "bg-cyan-900/50 text-cyan-200 hover:bg-cyan-800/50"
                }`}
              >
                {dt === "minimum" ? "Minimum" : dt === "normal" ? "Normal" : dt === "beast" ? "Beast" : "Recovery"}
              </button>
            ))}
          </div>
          <textarea
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.target.value)}
            placeholder="Valfritt: varför överskriver du? (t.ex. 'Känner mig stark idag')"
            className="w-full rounded border border-cyan-500/30 bg-cyan-950/30 p-2 text-sm text-cyan-200 placeholder-cyan-500/50"
            rows={2}
          />
        </div>
      )}

      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium text-cyan-300">Dagstyp:</span>{" "}
          <span className="text-cyan-200">{reasoning.dayType}</span>
        </div>
        <div>
          <span className="font-medium text-cyan-300">Energi:</span>{" "}
          <span className="text-cyan-200">{reasoning.energyLabel}</span>
        </div>
        <div>
          <span className="font-medium text-cyan-300">Block-mix:</span>{" "}
          <span className="text-cyan-200">{reasoning.blockMix}</span>
        </div>
        <div>
          <span className="font-medium text-cyan-300">Uppgiftsfokus:</span>{" "}
          <span className="text-cyan-200">{reasoning.tasksFocus}</span>
        </div>
        {reasoning.difficultyReasoning && (
          <div>
            <span className="font-medium text-cyan-300">Svårighetsgrad:</span>{" "}
            <span className="text-cyan-200">{reasoning.difficultyReasoning}</span>
          </div>
        )}
        {reasoning.safetyRules.length > 0 && (
          <div>
            <span className="font-medium text-cyan-300">Säkerhetsregler:</span>
            <ul className="ml-4 mt-1 list-disc space-y-1 text-cyan-200">
              {reasoning.safetyRules.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

