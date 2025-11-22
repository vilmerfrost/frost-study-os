import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { getUserConceptMastery } from "@/lib/concepts/mastery";

/**
 * Generate weekly insights for the user.
 * Aggregates last week's sessions, mastery changes, and review items.
 */
export async function GET(req: Request) {
  try {
    // Get user_id (placeholder for now - should come from auth)
    const userId = "00000000-0000-0000-0000-000000000000";

    // Calculate week start (Monday)
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday
    weekStart.setHours(0, 0, 0, 0);
    const weekStartStr = weekStart.toISOString().split("T")[0];

    // Check if insights already exist for this week
    const { data: existing } = await supabaseServer
      .from("weekly_insights")
      .select("*")
      .eq("user_id", userId)
      .eq("week_start", weekStartStr)
      .single();

    if (existing) {
      return NextResponse.json({ insight: existing }, { status: 200 });
    }

    // Get last week's sessions
    const weekAgo = new Date(weekStart);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { data: sessions } = await supabaseServer
      .from("study_sessions")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", weekAgo.toISOString())
      .lt("created_at", weekStart.toISOString())
      .order("created_at", { ascending: false });

    // Get concept mastery changes
    const masteryRecords = await getUserConceptMastery(userId, 1);

    // Calculate metrics
    const totalDeepWorkHours = (sessions || []).reduce((sum, s) => sum + (s.time_block || 0) / 60, 0);
    const avgCompletionRate =
      sessions && sessions.length > 0
        ? sessions.reduce((sum, s) => sum + (s.completion_rate || 0), 0) / sessions.length
        : 0;

    // Identify struggling concepts
    const strugglingConcepts = masteryRecords
      .filter((m) => m.struggling)
      .map((m) => m.concept_id);

    // Calculate phase progress (simplified)
    const phaseProgress: Record<number, number> = {};
    sessions?.forEach((s) => {
      if (!phaseProgress[s.phase]) {
        phaseProgress[s.phase] = 0;
      }
      phaseProgress[s.phase] += s.time_block || 0;
    });

    const metrics = {
      totalDeepWorkHours: Math.round(totalDeepWorkHours * 10) / 10,
      avgCompletionRate: Math.round(avgCompletionRate),
      phaseProgress,
      struggledConcepts: strugglingConcepts,
      totalSessions: sessions?.length || 0,
    };

    // Generate summary using simple template (can be enhanced with LLM)
    const summary = generateWeeklySummary(metrics, sessions || []);

    // Save to database
    const { data: insight, error } = await supabaseServer
      .from("weekly_insights")
      .insert({
        user_id: userId,
        week_start: weekStartStr,
        summary,
        metrics,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving weekly insight:", error);
      return NextResponse.json(
        { error: "Kunde inte spara weekly insight" },
        { status: 500 }
      );
    }

    return NextResponse.json({ insight }, { status: 200 });
  } catch (err) {
    console.error("Error in weekly-insights route:", err);
    return NextResponse.json(
      { error: "Något gick fel" },
      { status: 500 }
    );
  }
}

function generateWeeklySummary(metrics: any, sessions: any[]): string {
  const parts: string[] = [];

  parts.push(`Denna vecka: ${metrics.totalSessions} sessioner, ${metrics.totalDeepWorkHours}h deep work.`);

  if (metrics.avgCompletionRate >= 80) {
    parts.push(`Bra completion rate (${metrics.avgCompletionRate}%) - du håller dig till planerna!`);
  } else if (metrics.avgCompletionRate < 50) {
    parts.push(`Låg completion rate (${metrics.avgCompletionRate}%) - överväg att göra planerna mer realistiska.`);
  }

  if (metrics.struggledConcepts.length > 0) {
    parts.push(`Kämpade med: ${metrics.struggledConcepts.slice(0, 3).join(", ")}. Fokusera på grunderna nästa vecka.`);
  }

  // Recommendations
  const recommendations: string[] = [];
  if (metrics.totalDeepWorkHours < 5) {
    recommendations.push("Försök öka till minst 5h deep work nästa vecka");
  }
  if (metrics.struggledConcepts.length > 2) {
    recommendations.push("Överväg att gå tillbaka till grunderna för svåra koncept");
  }
  if (recommendations.length > 0) {
    parts.push(`Rekommendationer: ${recommendations.join("; ")}.`);
  }

  return parts.join(" ");
}

