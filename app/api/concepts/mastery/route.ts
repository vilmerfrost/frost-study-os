import { NextResponse } from "next/server";
import { getUserConceptMastery } from "@/lib/concepts/mastery";

/**
 * API route to fetch concept mastery for a user and phase.
 * This is needed because client components can't use supabaseServer directly.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const phase = searchParams.get("phase");

    if (!userId || !phase) {
      return NextResponse.json(
        { error: "userId and phase are required" },
        { status: 400 }
      );
    }

    const mastery = await getUserConceptMastery(userId, Number(phase));

    return NextResponse.json({ mastery }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching concept mastery:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch concept mastery" },
      { status: 500 }
    );
  }
}

