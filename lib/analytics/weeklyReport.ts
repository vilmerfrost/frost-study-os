import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface WeeklyReport {
    totalSessions: number;
    totalHours: number;
    avgEnergy: number;
    completionRate: number;
    mostStudiedTopics: string[];
    weakestTopics: string[];
    recommendedFocus: string[];
}

export async function getWeeklyReport(userId: string): Promise<WeeklyReport> {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: sessions } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", oneWeekAgo);

    if (!sessions || sessions.length === 0) {
        return {
            totalSessions: 0,
            totalHours: 0,
            avgEnergy: 0,
            completionRate: 0,
            mostStudiedTopics: [],
            weakestTopics: [],
            recommendedFocus: ["Start your first session!"],
        };
    }

    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const avgEnergy = Math.round((sessions.reduce((acc, s) => acc + (s.energy_level || 0), 0) / totalSessions) * 10) / 10;
    const completionRate = Math.round((sessions.reduce((acc, s) => acc + (s.completion_rate || 0), 0) / totalSessions) * 100);

    // Simple frequency map for topics
    const topicCounts: Record<string, number> = {};
    const topicScores: Record<string, number[]> = {};

    sessions.forEach(s => {
        const topic = s.topic || "Unknown";
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;

        if (!topicScores[topic]) topicScores[topic] = [];
        topicScores[topic].push(s.completion_rate || 0);
    });

    const sortedTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);
    const mostStudiedTopics = sortedTopics.slice(0, 3).map(t => t[0]);

    const weakTopics = Object.entries(topicScores)
        .map(([topic, scores]) => ({
            topic,
            avgScore: scores.reduce((a, b) => a + b, 0) / scores.length
        }))
        .sort((a, b) => a.avgScore - b.avgScore)
        .filter(t => t.avgScore < 0.7)
        .map(t => t.topic);

    const recommendedFocus = weakTopics.length > 0 ? weakTopics : ["Continue current progression"];

    return {
        totalSessions,
        totalHours,
        avgEnergy,
        completionRate,
        mostStudiedTopics,
        weakestTopics: weakTopics,
        recommendedFocus,
    };
}
