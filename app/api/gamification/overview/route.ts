import { NextResponse } from "next/server";
import { getGamificationOverview } from "@/lib/gamification/service";

export async function GET() {
  try {
    const overview = await getGamificationOverview();
    return NextResponse.json({ overview }, { status: 200 });
  } catch (err) {
    console.error("Gamification overview error:", err);
    return NextResponse.json(
      { error: "Kunde inte hämta gamification-data" },
      { status: 500 }
    );
  }
}

