// app/api/session/update-quality/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { ensureReviewItemsForSession } from "@/lib/review/reviewItems";
import { recordSessionGamification } from "@/lib/gamification/service";
import { analyzeCompletedSession } from "@/lib/analytics/sessionAnalyzer";
import { getConceptForYearDay } from "@/lib/concepts/concepts";
import { getYearDayByIndex } from "@/lib/yearBrain/helpers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      sessionId,
      dayType,
      understanding_score,
      difficulty_score,
      mood_after,
      completion_rate,
      retention_importance,
      reflection,
      yearDayIndex, // Optional: for concept mapping
    } = body;

    // Validate required fields
    if (!sessionId || !dayType) {
      return NextResponse.json({ error: "sessionId och dayType krävs" }, { status: 400 });
    }

    // Validate dayType
    const validDayTypes = ['minimum', 'normal', 'beast', 'recovery'];
    if (!validDayTypes.includes(dayType)) {
      return NextResponse.json(
        { error: `dayType must be one of: ${validDayTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate scores if provided
    if (understanding_score !== undefined && (understanding_score < 1 || understanding_score > 5)) {
      return NextResponse.json(
        { error: "understanding_score must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (difficulty_score !== undefined && (difficulty_score < 1 || difficulty_score > 5)) {
      return NextResponse.json(
        { error: "difficulty_score must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (completion_rate !== undefined && (completion_rate < 0 || completion_rate > 100)) {
      return NextResponse.json(
        { error: "completion_rate must be between 0 and 100" },
        { status: 400 }
      );
    }

    // Fetch the session first to get user_id and other data
    const { data: sessionData, error: fetchError } = await supabaseServer
      .from("study_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (fetchError || !sessionData) {
      console.error("Error fetching session:", fetchError);
      return NextResponse.json(
        { error: "Kunde inte hitta session" },
        { status: 404 }
      );
    }

    // Update session quality
    const { error } = await supabaseServer
      .from("study_sessions")
      .update({
        understanding_score,
        difficulty_score,
        mood_after,
        completion_rate,
        retention_importance,
        reflection,
      })
      .eq("id", sessionId);

    if (error) {
      console.error("Error updating session quality:", error);
      return NextResponse.json(
        { error: "Kunde inte uppdatera session" },
        { status: 500 }
      );
    }

    // Update gamification
    const gamification = await recordSessionGamification({
      dayType,
      completionRate: completion_rate,
    });

    // Analyze session and update concept mastery
    let analysisResult = null;
    try {
      // Get concept for this session
      const yearDay = yearDayIndex
        ? getYearDayByIndex(yearDayIndex)
        : getYearDayByIndex(1); // Fallback to day 1 if not provided
      
      const concept = yearDay ? getConceptForYearDay(yearDay) : null;

      // Analyze completed session
      analysisResult = await analyzeCompletedSession({
        session: {
          ...sessionData,
          understanding_score,
          completion_rate,
          reflection,
          retention_importance,
        } as any,
        concept,
        userId: sessionData.user_id,
      });

      // If analysis suggests reviews, ensure they're created
      if (analysisResult.suggestedReviews && analysisResult.suggestedReviews.length > 0) {
        if (retention_importance === "high") {
          await ensureReviewItemsForSession(sessionId);
        }
      }
    } catch (analysisError) {
      console.error("Error in session analysis:", analysisError);
      // Don't fail the request if analysis fails
    }

    // Ensure review items if retention is high (existing behavior)
    if (retention_importance === "high") {
      await ensureReviewItemsForSession(sessionId);
    }

    return NextResponse.json(
      {
        success: true,
        gamification,
        analysis: analysisResult,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in update-quality route:", err);
    return NextResponse.json(
      { error: "Något gick fel" },
      { status: 500 }
    );
  }
}

