import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import {
  calculatePhaseProgress,
  calculateDeepDiveProgress,
  type SessionSummary,
} from "@/lib/analytics/progress";

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("study_sessions")
      .select("phase, time_block, deep_dive_topic, deep_dive_day")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("Error fetching sessions for progress:", error);
      return NextResponse.json(
        { error: "Kunde inte hämta progress-data" },
        { status: 500 }
      );
    }

    const sessions = (data || []) as SessionSummary[];
    const phaseProgress = calculatePhaseProgress(sessions);
    const deepDiveProgress = calculateDeepDiveProgress(sessions);

    return NextResponse.json(
      { phaseProgress, deepDiveProgress },
      { status: 200 }
    );
  } catch (err) {
    console.error("Progress overview error:", err);
    return NextResponse.json(
      { error: "Något gick fel" },
      { status: 500 }
    );
  }
}

