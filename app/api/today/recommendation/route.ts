// app/api/today/recommendation/route.ts
import { NextResponse } from "next/server";
import { getRecommendedSession } from "@/lib/recommendations/todayPlan";

export async function GET() {
  try {
    const recommended = await getRecommendedSession();
    return NextResponse.json({ recommended }, { status: 200 });
  } catch (err) {
    console.error("Error getting recommendation:", err);
    return NextResponse.json(
      { error: "Kunde inte generera rekommendation" },
      { status: 500 }
    );
  }
}

