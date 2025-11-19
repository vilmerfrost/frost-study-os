import { supabaseServer } from "@/lib/supabaseServer";

const USER_ID = "00000000-0000-0000-0000-000000000001";

export interface SessionRecord {
  created_at: string;
  topic: string;
  phase: number;
  energy: number;
  time_block: number;
  understanding_score?: number | null;
  completion_rate?: number | null;
}

export interface EnergyPatternEntry {
  hour: number;
  avgEnergy: number;
  avgQuality: number;
}

export interface WeakTopic {
  topic: string;
  averageUnderstanding: number;
  sessions: number;
}

export interface WeeklyStats {
  sessions: number;
  minutes: number;
  avgEnergy: number;
}

export async function getWeeklyStats(): Promise<WeeklyStats> {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data, error } = await supabaseServer
    .from("study_sessions")
    .select("energy, time_block")
    .gte("created_at", weekAgo.toISOString());

  if (error) {
    console.error("Weekly stats error:", error);
    return { sessions: 0, minutes: 0, avgEnergy: 0 };
  }

  const sessions = data || [];
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.time_block || 0), 0);
  const avgEnergy =
    sessions.length > 0
      ? Math.round(
          (sessions.reduce((sum, s) => sum + (s.energy || 0), 0) / sessions.length) * 10
        ) / 10
      : 0;

  return {
    sessions: sessions.length,
    minutes: totalMinutes,
    avgEnergy,
  };
}

export async function getEnergyPattern(): Promise<EnergyPatternEntry[]> {
  const { data, error } = await supabaseServer
    .from("study_sessions")
    .select("created_at, energy, understanding_score")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error || !data) {
    return [];
  }

  const bucket: Record<number, { energyTotal: number; qualityTotal: number; count: number }> = {};

  data.forEach((session) => {
    const hour = new Date(session.created_at).getHours();
    if (!bucket[hour]) {
      bucket[hour] = { energyTotal: 0, qualityTotal: 0, count: 0 };
    }
    bucket[hour].energyTotal += session.energy || 0;
    bucket[hour].qualityTotal += session.understanding_score || 0;
    bucket[hour].count += 1;
  });

  return Object.entries(bucket).map(([hour, stats]) => ({
    hour: Number(hour),
    avgEnergy: Math.round((stats.energyTotal / stats.count) * 10) / 10,
    avgQuality: Math.round((stats.qualityTotal / stats.count) * 10) / 10,
  }));
}

export async function getWeakTopics(): Promise<WeakTopic[]> {
  const { data, error } = await supabaseServer
    .from("study_sessions")
    .select("topic, understanding_score")
    .not("understanding_score", "is", null)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error || !data) {
    return [];
  }

  const topicMap: Record<
    string,
    { total: number; count: number }
  > = {};

  data.forEach((session) => {
    if (session.understanding_score == null) return;
    if (!topicMap[session.topic]) {
      topicMap[session.topic] = { total: 0, count: 0 };
    }
    topicMap[session.topic].total += session.understanding_score;
    topicMap[session.topic].count += 1;
  });

  return Object.entries(topicMap)
    .map(([topic, stats]) => ({
      topic,
      averageUnderstanding: stats.total / stats.count,
      sessions: stats.count,
    }))
    .filter((t) => t.sessions >= 2)
    .sort((a, b) => a.averageUnderstanding - b.averageUnderstanding)
    .slice(0, 3);
}

