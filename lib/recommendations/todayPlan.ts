// lib/recommendations/todayPlan.ts
// Helper för att generera rekommenderat pass för idag baserat på historik

import { supabaseServer } from "@/lib/supabaseServer";
import type { DayType } from "@/lib/planEngine";
import { getWeeklyStats, type WeeklyStats } from "@/lib/analytics/analyzer";

export interface RecommendedSession {
  topic: string;
  phase: number;
  energy: number;
  timeBlock: number;
  dayType: DayType;
  deepDiveTopic?: string;
  deepDiveDay?: number;
  reason: string;
}

/**
 * Hämtar senaste sessioner för att analysera mönster
 */
async function getRecentSessions(limit: number = 10) {
  const { data, error } = await supabaseServer
    .from("study_sessions")
    .select("topic, phase, energy, time_block, deep_dive_topic, deep_dive_day, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent sessions:", error);
    return [];
  }

  return data || [];
}

/**
 * Bestämmer day type baserat på historik och energinivå
 */
function determineRecommendedDayType(
  energy: number,
  recentSessions: Array<{ energy?: number; time_block?: number }>
): DayType {
  // Räkna antal Beast-dagar i rad
  const recentEnergies = recentSessions.slice(0, 3).map((s) => s.energy || 3);
  const consecutiveHighEnergy = recentEnergies.filter((e) => e >= 4).length;

  // Safety: Max 3 Beast-dagar i rad
  if (consecutiveHighEnergy >= 3 && energy >= 4) {
    return "minimum";
  }

  // Recovery om låg energi och många tunga dagar
  const recentLowEnergy = recentEnergies.filter((e) => e <= 2).length;
  if (recentLowEnergy >= 2 && energy <= 2) {
    return "recovery";
  }

  // Normal logik
  if (energy <= 2) return "minimum";
  if (energy === 3) return "normal";
  if (energy >= 4) return "beast";
  return "normal";
}

/**
 * Föreslår topic och phase baserat på historik
 */
function suggestTopicAndPhase(
  recentSessions: Array<{ topic?: string; phase?: number; deep_dive_topic?: string; deep_dive_day?: number }>
): { topic: string; phase: number; deepDiveTopic?: string; deepDiveDay?: number } {
  if (recentSessions.length === 0) {
    // Default: börja med Phase 1, Linear Algebra
    return {
      topic: "linear_algebra_for_ml",
      phase: 1,
      deepDiveTopic: "linear_algebra_for_ml",
      deepDiveDay: 1,
    };
  }

  const latest = recentSessions[0];
  const topic = latest.topic || "linear_algebra_for_ml";
  const phase = latest.phase || 1;

  // Om det finns en pågående deep dive, fortsätt med den
  if (latest.deep_dive_topic && latest.deep_dive_day) {
    const nextDay = (latest.deep_dive_day || 0) + 1;
    if (nextDay <= 6) {
      return {
        topic,
        phase,
        deepDiveTopic: latest.deep_dive_topic,
        deepDiveDay: nextDay,
      };
    }
  }

  return { topic, phase };
}

/**
 * Genererar rekommenderat pass för idag
 */
export async function getRecommendedSession(): Promise<RecommendedSession> {
  const recentSessions = await getRecentSessions(10);
  const weeklyStats = await getWeeklyStats();

  // Föreslå topic och phase
  const { topic, phase, deepDiveTopic, deepDiveDay } = suggestTopicAndPhase(recentSessions);

  // Föreslå energi baserat på tid på dygnet och veckostatistik
  const now = new Date();
  const hour = now.getHours();
  let suggestedEnergy = 3; // default

  // Tid på dygnet-baserad energi (enkel heuristik)
  if (hour >= 6 && hour <= 10) {
    suggestedEnergy = 4; // Morgon = hög energi
  } else if (hour >= 14 && hour <= 18) {
    suggestedEnergy = 3; // Eftermiddag = normal
  } else if (hour >= 19 && hour <= 22) {
    suggestedEnergy = 4; // Kväll = kan vara hög
  } else {
    suggestedEnergy = 2; // Natt/tidig morgon = låg
  }

  // Justera baserat på veckostatistik (om många pass, kanske lägre energi)
  if (weeklyStats.sessions >= 5 && weeklyStats.avgEnergy >= 4) {
    suggestedEnergy = Math.max(2, suggestedEnergy - 1);
  }

  // Bestäm day type
  const dayType = determineRecommendedDayType(suggestedEnergy, recentSessions);

  // Föreslå tid baserat på day type
  let suggestedTimeBlock = 60;
  switch (dayType) {
    case "minimum":
      suggestedTimeBlock = 30;
      break;
    case "recovery":
      suggestedTimeBlock = 30;
      break;
    case "normal":
      suggestedTimeBlock = 60;
      break;
    case "beast":
      suggestedTimeBlock = 90;
      break;
  }

  // Generera reason
  let reason = "";
  if (deepDiveTopic && deepDiveDay) {
    reason = `Fortsätt med ${deepDiveTopic} (dag ${deepDiveDay}/6)`;
  } else if (recentSessions.length === 0) {
    reason = "Börja med Phase 1 – Linear Algebra for ML";
  } else {
    reason = `Fortsätt med ${topic} (Phase ${phase})`;
  }

  if (dayType === "recovery") {
    reason += " – Recovery-dag rekommenderas";
  } else if (dayType === "minimum" && recentSessions.length > 0) {
    reason += " – Lättare pass efter tunga dagar";
  }

  return {
    topic,
    phase,
    energy: suggestedEnergy,
    timeBlock: suggestedTimeBlock,
    dayType,
    deepDiveTopic,
    deepDiveDay,
    reason,
  };
}

