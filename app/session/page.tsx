"use client";

import { useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import type { StudyPlan, StudyBlock, DayPlan, DayType } from "@/lib/planEngine";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useClipboard } from "@/hooks/useClipboard";
import Toast from "@/components/Toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import BlockTimer from "@/components/BlockTimer";
import CheckboxList from "@/components/CheckboxList";
import SessionQualityModal from "@/components/SessionQualityModal";
import GamificationStrip from "@/components/GamificationStrip";
import PlanReasoningPanel from "@/components/PlanReasoningPanel";
import XPParticle from "@/components/XPParticle";
import VoiceInput from "@/components/VoiceInput";
import { SessionCompleteAnimation } from "@/components/SessionCompleteAnimation";
import { ContentCard } from "@/components/ui/ContentCard";
import { Button } from "@/components/ui/FrostButton";
import { useAchievements } from "@/hooks/useAchievements";
import { AchievementCelebration } from "@/components/AchievementCelebration";
import { motion, AnimatePresence } from "framer-motion";
import type { GamificationOverview } from "@/lib/gamification/service";
import {
  topicOptionsByPhase,
  summarizeYearDay,
  clampYearDayIndex,
  getNextYearDayIndex,
  getYearModuleByTopic,
  getYearDaysForTopic,
} from "@/lib/yearBrain/helpers";
import type { YearDay } from "@/config/yearBrain";

interface PlanResponse {
  plan: StudyPlan;
  markdown: string;
  phaseLabel: string;
  sessionId?: string | null;
}

const SETTINGS_KEY = "study-os-settings-v1";

export default function SessionPage() {
  const searchParams = useSearchParams();
  const [topic, setTopic] = useLocalStorage("study-os-topic", "linear_algebra_for_ml");
  const [phase, setPhase] = useLocalStorage("study-os-phase", 1);
  const [energy, setEnergy] = useLocalStorage("study-os-energy", 3);
  const [timeBlock, setTimeBlock] = useLocalStorage("study-os-timeBlock", 60);
  const [day, setDay] = useLocalStorage<number | undefined>("study-os-day", 1);
  const [generateWeekPlan, setGenerateWeekPlan] = useLocalStorage("study-os-weekPlan", false);
  const [numDays, setNumDays] = useLocalStorage("study-os-numDays", 7);

  // Pre-fill från query params (från Today-sidan)
  useEffect(() => {
    const topicParam = searchParams.get("topic");
    const phaseParam = searchParams.get("phase");
    const energyParam = searchParams.get("energy");
    const timeBlockParam = searchParams.get("timeBlock");
    const deepDiveTopicParam = searchParams.get("deepDiveTopic");
    const dayParam = searchParams.get("day");

    if (topicParam) setTopic(topicParam);
    if (phaseParam) setPhase(Number(phaseParam));
    if (energyParam) setEnergy(Number(energyParam));
    if (timeBlockParam) setTimeBlock(Number(timeBlockParam));
    if (deepDiveTopicParam) {
      // Om deep dive topic finns, sätt topic till samma
      setTopic(deepDiveTopicParam);
    }
    if (dayParam) setDay(Number(dayParam));
  }, [searchParams, setTopic, setPhase, setEnergy, setTimeBlock, setDay]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [reflection, setReflection] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"plan" | "markdown" | "reflection">("plan");
  const [gamification, setGamification] = useState<GamificationOverview | null>(null);
  const [recentBadge, setRecentBadge] = useState<string | null>(null);
  const [levelHighlight, setLevelHighlight] = useState(false);
  const [yearDayIndex, setYearDayIndex] = useLocalStorage<number>("vilmer-year-day-index", 1);
  const yearDaySummary = summarizeYearDay(yearDayIndex);
  const moduleDayPosition = useMemo(() => {
    if (!yearDaySummary) return null;
    const moduleDays = getYearDaysForTopic(yearDaySummary.yearDay.topicKey);
    const idx = moduleDays.findIndex(
      (d: YearDay) => d.dayIndex === yearDaySummary.yearDay.dayIndex
    );
    if (idx === -1) return null;
    return { current: idx + 1, total: moduleDays.length };
  }, [yearDaySummary]);
  const [agentPlan, setAgentPlan] = useState<string>("");
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [planProgress, setPlanProgress] = useState<{
    analyzer: string;
    tutor: string;
    planner: string;
  } | null>(null);
  const [xpParticles, setXpParticles] = useState<Array<{ id: number; xp: number }>>([]);
  const [focusMode, setFocusMode] = useState(false);
  const [showCompleteAnimation, setShowCompleteAnimation] = useState(false);
  const { triggerAchievement, currentAchievement, isVisible: achievementVisible, closeAchievement } = useAchievements();

  const clipboardMd = useClipboard();
  const clipboardReflection = useClipboard();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    setYearDayIndex((prev) => clampYearDayIndex(prev));
  }, [setYearDayIndex]);

  useEffect(() => {
    const group = topicOptionsByPhase.find((g) => g.phaseId === phase);
    if (!group || !group.topics.length) return;
    const exists = group.topics.some((t) => t.value === topic);
    if (!exists) {
      setTopic(group.topics[0].value);
    }
  }, [phase, topic, setTopic]);

  const fetchGamification = useCallback(async () => {
    try {
      const res = await fetch("/api/gamification/overview");
      if (!res.ok) return;
      const data = await res.json();
      setGamification(data.overview);
    } catch (err) {
      console.error("Failed to load gamification", err);
    }
  }, []);

  useEffect(() => {
    fetchGamification();
  }, [fetchGamification]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPlan(null);
    setMarkdown(null);
    setPlanProgress({ analyzer: "queued", tutor: "queued", planner: "queued" });

    try {
      // Create job
      const jobRes = await fetch("/api/plan-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          phase,
          energy,
          timeBlock,
          deepDiveTopic: topic,
          day,
          generateWeekPlan,
          numDays: generateWeekPlan ? numDays : undefined,
          yearDayIndex,
        }),
      });

      if (!jobRes.ok) {
        throw new Error("Kunde inte skapa plan job");
      }

      const { jobId } = await jobRes.json();

      // Connect to SSE stream
      const eventSource = new EventSource(`/api/plan-jobs/${jobId}/events`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "progress") {
          setPlanProgress(data.progress);
        } else if (data.type === "complete") {
          setPlan(data.result.plan);
          setMarkdown(data.result.markdown);
          setSessionId(null); // Will be set when plan is saved
          const title = data.result.plan.deepDiveName ?? data.result.plan.topic;
          const dayLabel = data.result.plan.deepDiveDay ?? 1;
          setReflection(
            `Dag ${dayLabel} – ${title}\n` +
              `- Viktigaste insikt:\n` +
              `- Fortfarande oklart:\n` +
              `- Energi / fokus idag:\n` +
              `- Nästa steg:\n`
          );
          setToast({ message: "Plan genererad! 🎉", type: "success" });
          setLoading(false);
          setPlanProgress(null);
          eventSource.close();
        } else if (data.type === "error") {
          setError(data.message);
          setLoading(false);
          setPlanProgress(null);
          eventSource.close();
        }
      };

      eventSource.onerror = () => {
        // Fallback: try polling instead
        eventSource.close();
        pollJobStatus(jobId);
      };
    } catch (err: any) {
      setError(err.message || "Något gick fel");
      setLoading(false);
      setPlanProgress(null);
    }
  }

  async function pollJobStatus(jobId: string) {
    const maxAttempts = 60; // 30 seconds max
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(interval);
        setError("Plan generation tog för lång tid");
        setLoading(false);
        setPlanProgress(null);
        return;
      }

      try {
        const res = await fetch(`/api/plan-jobs/${jobId}`);
        if (!res.ok) {
          throw new Error("Kunde inte hämta job status");
        }

        const job = await res.json();
        setPlanProgress(job.progress);

        if (job.status === "completed") {
          setPlan(job.result.plan);
          setMarkdown(job.result.markdown);
          setSessionId(null);
          const title = job.result.plan.deepDiveName ?? job.result.plan.topic;
          const dayLabel = job.result.plan.deepDiveDay ?? 1;
          setReflection(
            `Dag ${dayLabel} – ${title}\n` +
              `- Viktigaste insikt:\n` +
              `- Fortfarande oklart:\n` +
              `- Energi / fokus idag:\n` +
              `- Nästa steg:\n`
          );
          setToast({ message: "Plan genererad! 🎉", type: "success" });
          setLoading(false);
          setPlanProgress(null);
          clearInterval(interval);
        } else if (job.status === "failed") {
          setError(job.error || "Plan generation misslyckades");
          setLoading(false);
          setPlanProgress(null);
          clearInterval(interval);
        }
      } catch (err: any) {
        console.error("Error polling job:", err);
      }
    }, 500);
  }

  // Legacy function for direct plan generation (fallback)
  async function handleGenerateDirect(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPlan(null);
    setMarkdown(null);

    try {
      const res = await fetch("/api/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          phase,
          energy,
          timeBlock,
          deepDiveTopic: topic,
          day,
          generateWeekPlan,
          numDays: generateWeekPlan ? numDays : undefined,
          yearDayIndex,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Något gick fel.");
      }

      const data: PlanResponse = await res.json();
      setPlan(data.plan);
      setMarkdown(data.markdown);
      // Hämta sessionId från response om det finns
      if ((data as any).sessionId) {
        setSessionId((data as any).sessionId);
      }
      const title = data.plan.deepDiveName ?? data.plan.topic;
      const dayLabel = data.plan.deepDiveDay ?? 1;
      setReflection(
        `Dag ${dayLabel} – ${title}\n` +
          `- Viktigaste insikt:\n` +
          `- Fortfarande oklart:\n` +
          `- Energi / fokus idag:\n` +
          `- Nästa steg:\n`
      );
      setToast({ message: "Plan genererad! 🎉", type: "success" });
    } catch (err: any) {
      setError(err.message || "Kunde inte generera plan.");
      setToast({ message: err.message || "Något gick fel.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  const handleCopyMarkdown = async () => {
    if (markdown) {
      const success = await clipboardMd.copy(markdown);
      if (success) {
        setToast({ message: "Markdown kopierad! 📋", type: "success" });
      }
    }
  };

  const handleCopyReflection = async () => {
    if (reflection) {
      const success = await clipboardReflection.copy(reflection);
      if (success) {
        setToast({ message: "Reflektion kopierad! ✍️", type: "success" });
      }
    }
  };

  const resolvedDayType: DayType | undefined = plan
    ? plan.dayType ||
      (plan.isWeekPlan && plan.dayPlans?.length
        ? plan.dayPlans[0].dayType
        : plan.profile === "minimum"
        ? "minimum"
        : plan.profile === "beast"
        ? "beast"
        : "normal")
    : undefined;

  const handleSaveSessionQuality = async (data: {
    understanding_score: number;
    difficulty_score: number;
    mood_after: number;
    completion_rate: number;
    retention_importance: string;
    reflection: string;
  }) => {
    if (!resolvedDayType) {
      throw new Error("Day type saknas för gamification");
    }
    if (!sessionId) {
      // Om vi inte har sessionId, hitta senaste sessionen
      const res = await fetch("/api/session/latest");
      if (res.ok) {
        const { sessionId: latestId } = await res.json();
        if (latestId) {
          await updateSessionQuality(latestId, data, resolvedDayType);
          return;
        }
      }
      throw new Error("Kunde inte hitta session att uppdatera");
    }
    await updateSessionQuality(sessionId, data, resolvedDayType);
  };

  const updateSessionQuality = async (
    id: string,
    data: {
      understanding_score: number;
      difficulty_score: number;
      mood_after: number;
      completion_rate: number;
      retention_importance: string;
      reflection: string;
    },
    dayType: DayType
  ) => {
    const res = await fetch("/api/session/update-quality", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: id, dayType, ...data }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Kunde inte spara session quality");
    }

    setToast({ message: "Session sparad! 🎉", type: "success" });
    setShowCompleteAnimation(true);

    const result = await res.json();
    if (result?.gamification) {
      const prevLevel = gamification?.level ?? 0;
      const prevBadges = gamification?.badges?.length ?? 0;
      const prevXP = gamification?.totalXp ?? 0;
      const newXP = result.gamification.totalXp ?? 0;
      const xpGained = newXP - prevXP;
      
      setGamification(result.gamification);
      
      // Show XP particle animation
      if (xpGained > 0) {
        setXpParticles((prev) => [...prev, { id: Date.now(), xp: xpGained }]);
        setTimeout(() => {
          setXpParticles((prev) => prev.slice(1));
        }, 2000);
      }
      
      // Check for achievements via API
      try {
        const achievementRes = await fetch('/api/achievements/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            previousState: {
              level: prevLevel,
              streak: gamification?.streak ?? 0,
              badges: gamification?.badges ?? [],
            },
            currentState: {
              level: result.gamification.level,
              streak: result.gamification.streak,
              badges: result.gamification.badges,
              topicId: sessionId || undefined,
              topicName: topic,
              completedSessions: 1, // TODO: Get actual count
            },
          }),
        });

        if (achievementRes.ok) {
          const { achievement } = await achievementRes.json();
          if (achievement) {
            triggerAchievement(achievement);
          }
        }
      } catch (err) {
        console.error('Failed to check achievements:', err);
      }

      if (result.gamification.level > prevLevel) {
        setLevelHighlight(true);
        setTimeout(() => setLevelHighlight(false), 1500);
      }
      if (result.gamification.badges.length > prevBadges) {
        const newBadge =
          result.gamification.badges[result.gamification.badges.length - 1];
        setRecentBadge(newBadge);
        setTimeout(() => setRecentBadge(null), 3000);
      }
    } else {
      fetchGamification();
    }
    setYearDayIndex((prev) => getNextYearDayIndex(prev));
  };

  const handleRunAgentPlan = async () => {
    setAgentLoading(true);
    setAgentError(null);
    setAgentPlan("");
    try {
      const res = await fetch("/api/orchestrator/study-flow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          phase,
          energy,
          timeBlock,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Agent-plan misslyckades");
      }
      const data = await res.json();
      setAgentPlan(data.planText);
    } catch (err: any) {
      setAgentError(err.message || "Kunde inte köra multi-agent-planen");
    } finally {
      setAgentLoading(false);
    }
  };

  return (
    <>
      <main className="space-y-6">
        {/* Focus Mode Toggle */}
        <div className="flex items-center justify-end">
          <button
            onClick={() => setFocusMode(!focusMode)}
            className={`px-4 py-2 rounded-lg border transition-all text-sm ${
              focusMode
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
            }`}
          >
            {focusMode ? "🔍 Focus Mode ON" : "👁️ Focus Mode"}
          </button>
        </div>

        {!focusMode && gamification && (
          <GamificationStrip
            streak={gamification.streak}
            level={gamification.level}
            totalXp={gamification.totalXp}
            recentBadge={recentBadge}
            highlight={levelHighlight}
          />
        )}

        {!focusMode && yearDaySummary && (
          <AnimatePresence mode="wait">
            <YearDayCard
              key={yearDayIndex}
              summary={yearDaySummary}
              dayIndex={yearDayIndex}
              onShift={(delta) =>
                setYearDayIndex((prev) => clampYearDayIndex(prev + delta))
              }
            />
          </AnimatePresence>
        )}

        <div className={`grid gap-6 lg:grid-cols-2 ${focusMode ? "hidden" : ""}`}>
          <div className="space-y-6">
            <ContentCard
              title="Study Session Planner"
              subtitle="Välj phase, topic, energi & tid. Appen genererar ett strukturerat pass med block och uppgifter."
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-[#5B7CFF] to-[#B24BF3] bg-clip-text text-transparent">
                    Study Session Planner
                  </h1>
                  <VoiceInput
                    onResult={(text) => {
                      const timeMatch = text.match(/(\d+)\s*(?:min|minuter|minut)/i);
                      const energyMatch = text.match(/energy\s*(\d+)|energi\s*(\d+)/i);
                      const topicMatch = text.match(/(?:topic|ämne|fokus)\s*([^,]+)/i);

                      if (timeMatch) setTimeBlock(Number(timeMatch[1]));
                      if (energyMatch) setEnergy(Number(energyMatch[1] || energyMatch[2]));
                      if (topicMatch) {
                        setToast({ message: `Röst: ${text}`, type: "info" });
                        const topicText = topicMatch[1].trim().toLowerCase();
                        console.debug("Voice topic hint:", topicText);
                      } else {
                        setToast({ message: `Röst: ${text}`, type: "info" });
                      }
                    }}
                    onError={(error) => {
                      setToast({ message: `Röstfel: ${error}`, type: "error" });
                    }}
                  />
                </div>

                <form onSubmit={handleGenerate} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Topic (Year Brain)
                    </label>
                    <p className="text-xs text-gray-500">Allt kommer från din 12-månadersplan</p>
                    <select
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      value={topic}
                      onChange={(e) => {
                        const nextTopic = e.target.value;
                        setTopic(nextTopic);
                        const module = getYearModuleByTopic(nextTopic);
                        if (module) {
                          setPhase(module.phase);
                        }
                      }}
                    >
                      {topicOptionsByPhase.map((group) => (
                        <optgroup key={group.phaseId} label={group.phaseLabel}>
                          {group.topics.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Phase</label>
                      <p className="text-xs text-gray-500">Autofylld från Year Brain</p>
                      <select
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-70"
                        value={phase}
                        onChange={(e) => setPhase(Number(e.target.value))}
                      >
                        <option value={1}>1 – Foundations</option>
                        <option value={2}>2 – Deep Learning</option>
                        <option value={3}>3 – LLM / RAG / Agents</option>
                        <option value={4}>4 – Specialization</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Energi</label>
                      <p className="text-xs text-gray-500">1–5</p>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        value={energy}
                        onChange={(e) => setEnergy(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Tid</label>
                      <p className="text-xs text-gray-500">minuter</p>
                      <input
                        type="number"
                        min={20}
                        max={180}
                        step={5}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        value={timeBlock}
                        onChange={(e) => setTimeBlock(Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Deep dive-dag</label>
                      <p className="text-xs text-gray-500">
                        {moduleDayPosition
                          ? `Dag ${moduleDayPosition.current}/${moduleDayPosition.total}`
                          : "Autofyll"}
                      </p>
                      <input
                        type="number"
                        min={1}
                        max={6}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        value={day ?? ""}
                        onChange={(e) =>
                          setDay(e.target.value ? Number(e.target.value) : undefined)
                        }
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} size="lg" className="w-full">
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Genererar...</span>
                      </>
                    ) : (
                      "1. Generera plan med AI"
                    )}
                  </Button>

                  {planProgress && (
                    <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-3 text-xs space-y-2">
                      <p className="text-cyan-300 font-semibold">Plan generation progress:</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-cyan-200">Analyzer Agent</span>
                          <span
                            className={`${
                              planProgress.analyzer === "done"
                                ? "text-green-400"
                                : planProgress.analyzer === "running"
                                ? "text-yellow-400"
                                : "text-gray-400"
                            }`}
                          >
                            {planProgress.analyzer === "done"
                              ? "✓"
                              : planProgress.analyzer === "running"
                              ? "⟳"
                              : "○"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-cyan-200">Tutor Agent</span>
                          <span
                            className={`${
                              planProgress.tutor === "done"
                                ? "text-green-400"
                                : planProgress.tutor === "running"
                                ? "text-yellow-400"
                                : "text-gray-400"
                            }`}
                          >
                            {planProgress.tutor === "done"
                              ? "✓"
                              : planProgress.tutor === "running"
                              ? "⟳"
                              : "○"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-cyan-200">Planner Agent</span>
                          <span
                            className={`${
                              planProgress.planner === "done"
                                ? "text-green-400"
                                : planProgress.planner === "running"
                                ? "text-yellow-400"
                                : "text-gray-400"
                            }`}
                          >
                            {planProgress.planner === "done"
                              ? "✓"
                              : planProgress.planner === "running"
                              ? "⟳"
                              : "○"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleRunAgentPlan}
                    disabled={agentLoading}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-60 flex items-center justify-center gap-2 transition"
                  >
                    {agentLoading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Kör multi-agent...</span>
                      </>
                    ) : (
                      "2. Kör multi-agent"
                    )}
                  </button>

                  {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                      <p className="text-xs text-red-600">{error}</p>
                    </div>
                  )}
                </form>
              </div>
            </ContentCard>

            <ContentCard>
              <div className="flex items-center gap-2 text-xs font-semibold bg-gray-100 rounded-2xl p-1 mb-4">
                {[
                { id: "plan", label: "Plan" },
                { id: "markdown", label: "Markdown" },
                { id: "reflection", label: "Reflection" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 rounded-full px-3 py-2 transition-colors ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-[#5B7CFF] to-[#B24BF3] text-white shadow shadow-blue-500/30"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              </div>

              <div className="min-h-[200px]">
              {activeTab === "plan" && (
                <div className="space-y-3">
                  {plan ? (
                    plan.isWeekPlan && plan.dayPlans ? (
                      <WeekPlanView plan={plan} />
                    ) : (
                      <>
                        <PlanHeader plan={plan} yearDay={yearDaySummary?.yearDay} />
                        {plan.reasoning && (
                          <PlanReasoningPanel
                            reasoning={plan.reasoning}
                            currentDayType={plan.dayType}
                            onOverride={async (newDayType, reason) => {
                              try {
                                const res = await fetch("/api/planner/override", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    prevDayType: plan.dayType || "normal",
                                    newDayType,
                                    reason,
                                  }),
                                });
                                if (res.ok) {
                                  setToast({ message: "Överskrivning sparad", type: "success" });
                                  // Optionally regenerate plan with new day type
                                } else {
                                  setToast({ message: "Kunde inte spara överskrivning", type: "error" });
                                }
                              } catch (err) {
                                setToast({ message: "Fel vid överskrivning", type: "error" });
                              }
                            }}
                          />
                        )}
                        {plan.insights && plan.insights.length > 0 && (
                          <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4 text-xs text-slate-200 space-y-1">
                            {plan.insights.map((insight) => (
                              <p key={insight}>💡 {insight}</p>
                            ))}
                          </div>
                        )}
                        <div className="space-y-3">
                          {plan.blocks.map((b: StudyBlock, i: number) => (
                            <BlockCard key={i} block={b} index={i} planId={plan.topic + plan.phase} />
                          ))}
                        </div>
                      </>
                    )
                  ) : (
                    <EmptyState />
                  )}
                </div>
              )}

              {activeTab === "markdown" && (
                <div className="space-y-3">
                  {plan && markdown ? (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-sm font-semibold">📋 Markdown-checklista</h2>
                        <button
                          onClick={handleCopyMarkdown}
                          className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors font-medium"
                        >
                          {clipboardMd.copied ? "Kopierad ✅" : "Kopiera"}
                        </button>
                      </div>
                      <textarea
                        readOnly
                        className="w-full h-48 text-xs rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 font-mono resize-none outline-none"
                        value={markdown}
                      />
                      <p className="text-[11px] text-slate-400">Klistra in i Notion / Obsidian / Notes.</p>
                    </>
                  ) : (
                    <EmptyState message="Generera en plan för att skapa Markdown." />
                  )}
                </div>
              )}

              {activeTab === "reflection" && (
                <div className="space-y-3">
                  {plan ? (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-sm font-semibold">✍️ Reflection / study log</h2>
                        <button
                          onClick={handleCopyReflection}
                          className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors font-medium"
                        >
                          {clipboardReflection.copied ? "Kopierad ✅" : "Kopiera"}
                        </button>
                      </div>
                      <textarea
                        className="w-full min-h-[160px] text-xs rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 resize-y outline-none focus:border-sky-500 transition-colors"
                        value={reflection}
                        onChange={(e) => setReflection(e.target.value)}
                        placeholder="Skriv dina reflektioner här..."
                      />
                      <button
                        onClick={() => setShowQualityModal(true)}
                        className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:from-green-400 hover:to-emerald-500 transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/30"
                      >
                        ✅ Markera pass som klart
                      </button>
                      <p className="text-[11px] text-slate-400 text-center">
                        Ge feedback efter passet för bättre rekommendationer.
                      </p>
                    </>
                  ) : (
                    <EmptyState message="Generera plan först så finns det något att reflektera över." />
                  )}
                </div>
              )}
              </div>
            </ContentCard>
          </div>
        </div>

        {!focusMode && agentError && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">
            {agentError}
          </div>
        )}

        {!focusMode && agentPlan && (
          <section className="rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">🧠 Multi-agent plan (study_flow.py)</h2>
              <span className="text-xs text-slate-500">Python + LangGraph</span>
            </div>
            <pre className="rounded-2xl border border-white/5 bg-black/40 p-4 text-xs text-slate-200 whitespace-pre-wrap">
              {agentPlan}
            </pre>
          </section>
        )}

        {/* Session Quality Modal */}
        <SessionQualityModal
          isOpen={showQualityModal}
          onClose={() => setShowQualityModal(false)}
          onSave={handleSaveSessionQuality}
          sessionId={sessionId || undefined}
        />
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => setToast(null)}
        />
      )}

      {/* XP Particle Animations */}
      <AnimatePresence>
        {xpParticles.map((particle) => (
          <XPParticle
            key={particle.id}
            xp={particle.xp}
            onComplete={() => {
              setXpParticles((prev) => prev.filter((p) => p.id !== particle.id));
            }}
          />
        ))}
      </AnimatePresence>

      {/* Session Complete Animation */}
      <SessionCompleteAnimation
        isVisible={showCompleteAnimation}
        xp={gamification?.totalXp || 0}
        duration={`${plan?.timeBlock || 0}min`}
        onClose={() => setShowCompleteAnimation(false)}
      />

      {/* Achievement Celebration */}
      {currentAchievement && (
        <AchievementCelebration
          isVisible={achievementVisible}
          type={currentAchievement.type}
          title={currentAchievement.title}
          message={currentAchievement.message}
          xp={currentAchievement.xp}
          badge={currentAchievement.badge}
          onClose={closeAchievement}
        />
      )}
    </>
  );
}

function PlanHeader({ plan, yearDay }: { plan: StudyPlan; yearDay?: YearDay | null }) {
  const totalDays =
    plan.deepDiveTopicId === "linear_algebra_for_ml" ? 6 : 1;
  const currentDay = plan.deepDiveDay ?? 1;
  const pct = Math.round((currentDay / totalDays) * 100);
  const dayTypeCopy: Record<string, string> = {
    minimum: "Idag är fokus att inte krascha. 30 lugna minuter räcker 👌",
    normal: "Stabil dag – håll tempot och ta korta pauser.",
    beast: "Full send-läge – men bara om du sov bra. Ta pauser.",
    recovery: "Recovery-dag. Vi skyddar framtida Vilmer.",
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-5 space-y-3 shadow-lg">
      <div>
        <p className="text-xs uppercase text-slate-400 tracking-wider mb-2">Session</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold">{plan.timeBlock} min</span>
          <span className="text-slate-500">•</span>
          <span className="text-sm">energi {plan.energy}/5</span>
          <span className="text-slate-500">•</span>
          <span className="text-sm font-semibold">{plan.profile}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              plan.intensityLevel === 1
                ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                : plan.intensityLevel === 2
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
            }`}
          >
            Level {plan.intensityLevel} –{" "}
            {plan.intensityLevel === 1
              ? "Survival"
              : plan.intensityLevel === 2
              ? "Standard"
              : "Beast"}
          </span>
        </div>
      </div>
      <p className="text-sm text-slate-300">
        Phase {plan.phase} – <code className="text-sky-400">{plan.topic}</code>
      </p>
      {plan.deepDiveMode && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <p className="font-semibold text-sm">
            🔥 Deep dive: {plan.deepDiveName} (dag {currentDay} av {totalDays})
          </p>
          {plan.deepDiveSubtopics && (
            <p className="text-slate-300 text-xs">
              Fokus: {plan.deepDiveSubtopics.join(", ")}
            </p>
          )}
          {plan.deepDiveWhy && (
            <p className="text-slate-400 text-xs">{plan.deepDiveWhy}</p>
          )}
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Progress</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-blue-500 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      )}
      {plan.dayType && (
        <p className="text-xs text-slate-400 bg-slate-800/60 rounded-xl px-3 py-2">
          {dayTypeCopy[plan.dayType]}
        </p>
      )}
      {yearDay && (
        <div className="rounded-xl bg-slate-900/40 border border-slate-800/60 p-3 space-y-1 text-xs text-slate-300">
          <p className="font-semibold text-slate-100">
            📆 Year Brain dag {yearDay.dayIndex}
          </p>
          <p>{yearDay.title}</p>
          <p className="text-slate-400">Fokus: {yearDay.focusArea}</p>
        </div>
      )}
    </div>
  );
}

function WeekPlanView({ plan }: { plan: StudyPlan }) {
  if (!plan.dayPlans) return null;

  const totalMinutes = plan.dayPlans.reduce((sum, dp) => sum + dp.timeBlock, 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  return (
    <div className="space-y-6">
      <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800/50 rounded-2xl p-5 space-y-3 shadow-lg">
        <div>
          <p className="text-xs uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Veckoplan</p>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">{plan.topic}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Phase {plan.phase} • {plan.dayPlans.length} dagar • Totalt {totalHours}h
          </p>
        </div>
        {plan.deepDiveMode && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              🔥 Deep dive: {plan.deepDiveTopicId}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {plan.dayPlans.map((dayPlan) => (
          <DayPlanCard key={dayPlan.day} dayPlan={dayPlan} planId={plan.topic + plan.phase} />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ message = "Generera en plan för att komma igång." }: { message?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/30 p-6 text-center text-xs text-slate-400">
      {message}
    </div>
  );
}

function DayPlanCard({ dayPlan, planId }: { dayPlan: DayPlan; planId: string }) {
  const dateStr = dayPlan.date
    ? new Date(dayPlan.date).toLocaleDateString("sv-SE", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : `Dag ${dayPlan.day}`;

  const dayTypeColors: Record<DayType, string> = {
    minimum: "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30",
    normal: "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30",
    beast: "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30",
    recovery: "bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30",
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800/50 rounded-2xl p-5 shadow-md">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-base text-slate-900 dark:text-slate-50">{dateStr}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium border ${dayTypeColors[dayPlan.dayType]}`}
            >
              {dayPlan.dayType.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>⚡ Energi {dayPlan.energy}/5</span>
            <span>•</span>
            <span>⏱ {dayPlan.timeBlock} min</span>
          </div>
          {dayPlan.notes && (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-2">{dayPlan.notes}</p>
          )}
        </div>
      </div>

      <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
        {dayPlan.blocks.map((block: StudyBlock, i: number) => (
          <BlockCard
            key={i}
            block={block}
            index={i}
            planId={`${planId}-day-${dayPlan.day}`}
            compact
          />
        ))}
      </div>
    </div>
  );
}

function BlockCard({
  block,
  index,
  planId,
  compact = false,
}: {
  block: StudyBlock;
  index: number;
  planId: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(!compact);
  return (
    <div className={`bg-slate-800/40 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 dark:border-slate-800/50 rounded-xl ${compact ? "p-3" : "p-5"} space-y-2 shadow-md hover:border-slate-600/50 dark:hover:border-slate-700/50 transition-all`}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className={`uppercase tracking-wider ${compact ? "text-[10px] text-slate-500" : "text-xs text-slate-400"}`}>
              Block {index + 1} – {block.type.toUpperCase()}
            </p>
          </div>
          <p className={`font-medium ${compact ? "text-xs text-slate-200" : "text-sm text-slate-100"}`}>{block.description}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-2.5 py-1 rounded-full bg-slate-800 font-medium whitespace-nowrap ${compact ? "text-[10px]" : "text-xs"}`}>
            {block.duration} min
          </span>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="text-[10px] text-slate-400 hover:text-slate-200"
          >
            {open ? "Stäng" : "Visa"}
          </button>
        </div>
      </div>

      {!compact && open && <BlockTimer duration={block.duration} />}

      {open && block.goal && (
        <div className="rounded-lg bg-slate-800/50 px-3 py-2">
          <p className="text-xs text-slate-300">
            <span className="font-semibold text-sky-400">🎯 Mål:</span> {block.goal}
          </p>
        </div>
      )}

      {open && (
        <>
          <div className="space-y-2">
            {block.notebooklmSource && (
              <p className="text-xs text-slate-400">
                🔗 NotebookLM-pack: <code className="text-sky-400">{block.notebooklmSource}</code>
              </p>
            )}

            {block.level && (
              <p className="text-xs text-slate-400">
                🧠 Svårighetsgrad: <span className="font-semibold capitalize">{block.level}</span>
              </p>
            )}
          </div>

          {block.tasks && block.tasks.length > 0 && (
            <CheckboxList
              items={block.tasks}
              storageKey={`${planId}-block-${index}-tasks`}
              label="✅ Förslag på delsteg"
            />
          )}

          {block.aiGeneratedTasks && block.aiGeneratedTasks.length > 0 && (
            <CheckboxList
              items={block.aiGeneratedTasks}
              storageKey={`${planId}-block-${index}-ai-tasks`}
              label="🤖 AI-genererade extraövningar"
            />
          )}
        </>
      )}
    </div>
  );
}

function YearDayCard({
  summary,
  dayIndex,
  onShift,
}: {
  summary: NonNullable<ReturnType<typeof summarizeYearDay>>;
  dayIndex: number;
  onShift: (delta: number) => void;
}) {
  const { yearDay, module, phase } = summary;
  return (
    <motion.div
      key={dayIndex}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1c1b2f]/80 to-slate-950/70 p-4 shadow-xl flex flex-col gap-3 text-xs md:text-sm"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.25),_transparent_60%)] pointer-events-none" />
      <div className="relative flex flex-col gap-3">
        <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase text-slate-500">Year brain</p>
          <motion.p
            key={`day-${dayIndex}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="font-semibold text-slate-900 dark:text-white"
          >
            Dag {dayIndex} • {yearDay.title}
          </motion.p>
        </div>
        <div className="flex items-center gap-1">
          <motion.button
            type="button"
            onClick={() => onShift(-1)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="h-8 w-8 rounded-full border border-white/20 text-slate-300 hover:border-sky-500 hover:text-white backdrop-blur"
          >
            -
          </motion.button>
          <motion.button
            type="button"
            onClick={() => onShift(1)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="h-8 w-8 rounded-full border border-white/20 text-slate-300 hover:border-sky-500 hover:text-white backdrop-blur"
          >
            +
          </motion.button>
        </div>
        </div>
      <div className="grid gap-2 md:grid-cols-3">
        <motion.div
          key={`phase-${phase?.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-[11px] text-slate-500">Phase</p>
          <p className="font-medium">{phase?.name}</p>
        </motion.div>
        <motion.div
          key={`module-${module?.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <p className="text-[11px] text-slate-500">Modul</p>
          <p className="font-medium">{module?.title}</p>
        </motion.div>
        <motion.div
          key={`focus-${yearDay.focusArea}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-[11px] text-slate-500">Fokus</p>
          <p className="font-medium">{yearDay.focusArea}</p>
        </motion.div>
      </div>
      <motion.div
        key={`goals-${dayIndex}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="text-[11px] text-slate-500 space-y-1"
      >
        <p>Goals idag:</p>
        <ul className="list-disc list-inside space-y-0.5">
          {yearDay.goals.map((goal) => (
            <li key={goal}>{goal}</li>
          ))}
        </ul>
      </motion.div>
      </div>
    </motion.div>
  );
}

function FrostField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2 group">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-400">
        <p>{label}</p>
        {hint && <p className="text-slate-500 normal-case">{hint}</p>}
      </div>
      <div className="relative rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2.5 transition focus-within:border-fuchsia-400/70 focus-within:bg-slate-950/80">
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-fuchsia-500/15 to-sky-500/15 opacity-0 blur-xl transition group-focus-within:opacity-100" />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
