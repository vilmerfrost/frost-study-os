// app/today/page.tsx - Frost Bygg Style
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { RecommendedSession } from "@/lib/recommendations/todayPlan";
import type { WeeklyStats } from "@/lib/analytics/analyzer";
import type { ReviewItem } from "@/lib/review/reviewItems";
import type { PhaseProgress, DeepDiveProgress } from "@/lib/analytics/progress";
import type { GamificationOverview } from "@/lib/gamification/service";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";
import { ContentCard } from "@/components/ui/ContentCard";
import { Button } from "@/components/ui/FrostButton";
import { KPICard } from "@/components/ui/KPICard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import ConceptGraphMini from "@/components/ConceptGraphMini";
import EnergyHeatmap from "@/components/EnergyHeatmap";
import { ResourceHunter } from "@/components/ResourceHunter";
import { CoPilotSidebar } from "@/components/CoPilotSidebar";
import { PracticeProblems } from "@/components/PracticeProblems";
import { ExportToNotebookLM } from "@/components/ExportToNotebookLM";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { summarizeYearDay, clampYearDayIndex } from "@/lib/yearBrain/helpers";

export default function TodayPage() {
  const router = useRouter();
  const [yearDayIndex] = useLocalStorage<number>("vilmer-year-day-index", 1);
  const [loading, setLoading] = useState(true);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [recommended, setRecommended] = useState<RecommendedSession | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [phaseProgress, setPhaseProgress] = useState<PhaseProgress[]>([]);
  const [deepDiveProgress, setDeepDiveProgress] = useState<DeepDiveProgress[]>([]);
  const [gamification, setGamification] = useState<GamificationOverview | null>(null);
  const [activeReview, setActiveReview] = useState<ReviewItem | null>(null);
  const [reviewQuality, setReviewQuality] = useState(4);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [dailyBriefing, setDailyBriefing] = useState<string>("");
  
  const yearDaySummary = useMemo(() => summarizeYearDay(clampYearDayIndex(yearDayIndex)), [yearDayIndex]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [recRes, statsRes, reviewRes, progressRes, gamificationRes, briefingRes] = await Promise.all([
          fetch("/api/today/recommendation"),
          fetch("/api/today/weekly-stats"),
          fetch("/api/today/review-items"),
          fetch("/api/progress/overview"),
          fetch("/api/gamification/overview"),
          fetch("/api/today/message").catch(() => null), // Optional
        ]);

        if (!recRes.ok || !statsRes.ok || !reviewRes.ok || !progressRes.ok || !gamificationRes.ok) {
          throw new Error("Kunde inte ladda data");
        }

        const [recData, statsData, reviewData, progressData, gamificationData, briefingData] =
          await Promise.all([
            recRes.json(),
            statsRes.json(),
            reviewRes.json(),
            progressRes.json(),
            gamificationRes.json(),
            briefingRes?.json().catch(() => null),
          ]);

        setRecommended(recData.recommended);
        setWeeklyStats(statsData.stats);
        setReviewItems(reviewData.reviewItems || []);
        setPhaseProgress(progressData.phaseProgress || []);
        setDeepDiveProgress(progressData.deepDiveProgress || []);
        setGamification(gamificationData.overview || null);
        setDailyBriefing(briefingData?.message || "");
      } catch (err: any) {
        setError(err.message || "Något gick fel");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleStartSession = () => {
    if (!recommended) return;
    const params = new URLSearchParams({
      topic: recommended.topic,
      phase: recommended.phase.toString(),
      energy: recommended.energy.toString(),
      timeBlock: recommended.timeBlock.toString(),
      ...(recommended.deepDiveTopic && { deepDiveTopic: recommended.deepDiveTopic }),
      ...(recommended.deepDiveDay && { day: recommended.deepDiveDay.toString() }),
    });
    router.push(`/session?${params.toString()}`);
  };

  const handleStartReview = (item: ReviewItem) => {
    router.push(`/session?topic=${item.topic}&subtopic=${item.subtopic}`);
  };

  const handleOpenReviewModal = (item: ReviewItem) => {
    setActiveReview(item);
  };

  const handleSubmitReview = async () => {
    if (!activeReview) return;
    setReviewSaving(true);
    try {
      const res = await fetch("/api/review/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewItemId: activeReview.id,
          quality: reviewQuality,
        }),
      });
      if (!res.ok) throw new Error("Kunde inte spara review");
      setToast({ message: "Review sparad! 🎉", type: "success" });
      setActiveReview(null);
      const reviewRes = await fetch("/api/today/review-items");
      const reviewData = await reviewRes.json();
      setReviewItems(reviewData.reviewItems || []);
    } catch (err: any) {
      setToast({ message: err.message || "Kunde inte spara review", type: "error" });
    } finally {
      setReviewSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <ContentCard>
        <p className="text-red-600">{error}</p>
      </ContentCard>
    );
  }

  const currentPhase = phaseProgress.find((p) => p.phase === yearDaySummary?.yearDay.phase);
  const phaseProgressPct = currentPhase ? Math.round((currentPhase.completedDays / currentPhase.totalDays) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span>Dag {yearDaySummary?.yearDay.dayIndex || 1} / 365</span>
            <span>•</span>
            <span>{yearDaySummary?.phase?.name || `Phase ${yearDaySummary?.yearDay.phase || 1}`}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Today's Deep Work</h1>
        </div>
        <Button variant="primary" onClick={() => setCopilotOpen(true)}>
          💬 Öppna Co-Pilot
        </Button>
      </div>

      {/* KPI Cards */}
      {weeklyStats && (
        <div className="grid grid-cols-4 gap-4">
          <KPICard 
            label="Total Timmar"
            value={`${Math.round((weeklyStats.minutes / 60) * 10) / 10}h`}
            change="+5%"
            changeType="positive"
          />
          <KPICard 
            label="Sessions"
            value={weeklyStats.sessions.toString()}
            change="denna vecka"
            changeType="neutral"
          />
          <KPICard 
            label="Phase Progress"
            value={`${phaseProgressPct}%`}
            change={yearDaySummary?.phase?.name || "Phase 1"}
            changeType="neutral"
          />
          <KPICard 
            label="Current Streak"
            value={gamification?.streak ? `${gamification.streak} days` : "0 days"}
            change="🔥"
            changeType="positive"
          />
        </div>
      )}

      {/* AI Briefing */}
      {(dailyBriefing || yearDaySummary) && (
        <ContentCard>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5B7CFF] to-[#B24BF3] flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🧠</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Daily Briefing</h3>
              <p className="text-gray-700 leading-relaxed">
                {dailyBriefing || (yearDaySummary && `Fokus idag: ${yearDaySummary.yearDay.focusArea}. ${yearDaySummary.yearDay.goals.slice(0, 2).join(". ")}.`)}
              </p>
            </div>
          </div>
        </ContentCard>
      )}

      {/* Today's Plan */}
      {recommended && (
        <ContentCard 
          title="Today's Plan"
          subtitle={`${recommended.timeBlock} min · Energy ${recommended.energy}/5`}
          action={<Button size="sm" onClick={handleStartSession}>Start Session</Button>}
        >
          <div className="space-y-3">
            <motion.div
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer group"
              whileHover={{ x: 4 }}
              onClick={handleStartSession}
            >
              <div className="w-1.5 h-16 bg-gradient-to-b from-[#5B7CFF] to-[#B24BF3] rounded-full" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{recommended.topic}</h4>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span>📚 Study Session</span>
                  <span>•</span>
                  <span>{recommended.timeBlock} min</span>
                  <span>•</span>
                  <span>Energy: {recommended.energy}/5</span>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.div>
          </div>
        </ContentCard>
      )}

      {/* Review Items */}
      {reviewItems.length > 0 && (
        <ContentCard 
          title={`Reviews (${reviewItems.length})`}
          action={<Button variant="ghost" size="sm" onClick={() => router.push("/history")}>View All</Button>}
        >
          <div className="space-y-2">
            {reviewItems.slice(0, 3).map((item) => (
              <motion.div
                key={item.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                whileHover={{ x: 2 }}
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.subtopic}</p>
                  <p className="text-xs text-gray-500">{item.topic}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleStartReview(item)}>
                  Review
                </Button>
              </motion.div>
            ))}
          </div>
        </ContentCard>
      )}

      {/* Resource Hunter */}
      {yearDaySummary && (
        <ResourceHunter
          topic={yearDaySummary.yearDay.focusArea || yearDaySummary.module?.title || "Study"}
          masteryLevel={50} // TODO: Get from concept mastery
        />
      )}

      {/* Practice Problems */}
      {yearDaySummary && (
        <PracticeProblems
          topic={yearDaySummary.yearDay.focusArea || yearDaySummary.module?.title || "Study"}
          difficulty="medium"
        />
      )}

      {/* Dashboard Widgets */}
      {yearDaySummary && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ConceptGraphMini phase={yearDaySummary.yearDay.phase} />
          <EnergyHeatmap days={30} />
        </div>
      )}

      {/* Review Modal */}
      {activeReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
          <ContentCard className="max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Review</h3>
            <p className="text-gray-700 mb-4">{activeReview.subtopic}</p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setActiveReview(null)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitReview} disabled={reviewSaving}>
                {reviewSaving ? "Saving..." : "Complete"}
              </Button>
            </div>
          </ContentCard>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => setToast(null)}
        />
      )}

      {/* Co-Pilot Sidebar */}
      {yearDaySummary && (
        <CoPilotSidebar
          sessionContext={{
            topic: yearDaySummary.yearDay.focusArea || yearDaySummary.module?.title || "Study",
            masteryLevel: 50,
            blockType: "study",
            energy: 3,
          }}
          isOpen={copilotOpen}
          onClose={() => setCopilotOpen(false)}
        />
      )}
    </div>
  );
}
