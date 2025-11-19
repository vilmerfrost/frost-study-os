import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

/**
 * API route to fetch session data for energy heatmap.
 * This is needed because client components can't use supabaseServer directly.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const days = searchParams.get("days") || "30";

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const { data, error } = await supabaseServer
      .from("study_sessions")
      .select("created_at, energy, understanding_score, completion_rate")
      .eq("user_id", userId)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Group by date and calculate average energy/quality
    const dateMap = new Map<string, { energy: number[]; quality: number[] }>();

    data?.forEach((session) => {
      const date = new Date(session.created_at).toISOString().split("T")[0];
      if (!dateMap.has(date)) {
        dateMap.set(date, { energy: [], quality: [] });
      }
      const entry = dateMap.get(date)!;
      if (session.energy) entry.energy.push(session.energy);
      if (session.understanding_score) {
        entry.quality.push(session.understanding_score);
      }
    });

    const heatmap = Array.from(dateMap.entries()).map(([date, values]) => ({
      date,
      energy: values.energy.length > 0 
        ? Math.round(values.energy.reduce((a, b) => a + b, 0) / values.energy.length) 
        : 0,
      quality: values.quality.length > 0 
        ? Math.round(values.quality.reduce((a, b) => a + b, 0) / values.quality.length) 
        : 0,
    }));

    return NextResponse.json({ heatmap }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching heatmap data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch heatmap data" },
      { status: 500 }
    );
  }
}

