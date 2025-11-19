// components/SessionQualityModal.tsx
"use client";

import { useState } from "react";
import type { SessionQualityInput } from "@/lib/analytics/sessionQuality";
import { calculateSessionQuality, getQualityLabel } from "@/lib/analytics/sessionQuality";

interface SessionQualityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SessionQualityInput & { retention_importance: string; reflection: string }) => Promise<void>;
  sessionId?: string;
}

export default function SessionQualityModal({
  isOpen,
  onClose,
  onSave,
}: SessionQualityModalProps) {
  const [understanding, setUnderstanding] = useState(3);
  const [difficulty, setDifficulty] = useState(3);
  const [mood, setMood] = useState(3);
  const [completion, setCompletion] = useState(100);
  const [retentionImportance, setRetentionImportance] = useState<"low" | "medium" | "high">("medium");
  const [reflection, setReflection] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const qualityScore = calculateSessionQuality({
    understanding_score: understanding,
    difficulty_score: difficulty,
    mood_after: mood,
    completion_rate: completion,
  });
  const qualityLabel = getQualityLabel(qualityScore);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        understanding_score: understanding,
        difficulty_score: difficulty,
        mood_after: mood,
        completion_rate: completion,
        retention_importance: retentionImportance,
        reflection,
      });
      onClose();
      // Reset form
      setUnderstanding(3);
      setDifficulty(3);
      setMood(3);
      setCompletion(100);
      setRetentionImportance("medium");
      setReflection("");
    } catch (err) {
      console.error("Error saving session quality:", err);
      alert("Kunde inte spara. Försök igen.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Markera pass som klart ✨</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Understanding Score */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Förståelse (1-5): {understanding}
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={understanding}
              onChange={(e) => setUnderstanding(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Mycket låg</span>
              <span>Mycket hög</span>
            </div>
          </div>

          {/* Difficulty Score */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Svårighet (1-5): {difficulty}
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Mycket lätt</span>
              <span>Mycket svår</span>
            </div>
          </div>

          {/* Mood After */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Humör efter (1-5): {mood}
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={mood}
              onChange={(e) => setMood(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Dåligt</span>
              <span>Utmärkt</span>
            </div>
          </div>

          {/* Completion Rate */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Genomförande (%): {completion}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={completion}
              onChange={(e) => setCompletion(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Retention Importance */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Retention-importance
            </label>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setRetentionImportance(level)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    retentionImportance === level
                      ? "bg-sky-500 text-white"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {level === "low" ? "Låg" : level === "medium" ? "Medel" : "Hög"}
                </button>
              ))}
            </div>
          </div>

          {/* Reflection */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Reflektion (valfritt)
            </label>
            <textarea
              className="w-full min-h-[80px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm resize-y outline-none focus:border-sky-500"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Vad gick bra? Vad var svårt? Nästa steg?"
            />
          </div>

          {/* Quality Score Preview */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Session quality:</span>
              <span className="text-sm font-semibold">
                {qualityLabel} ({Math.round(qualityScore * 100)}%)
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Avbryt
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-semibold hover:from-sky-400 hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {saving ? "Sparar..." : "Spara"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

