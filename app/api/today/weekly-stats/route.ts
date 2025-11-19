// app/api/today/weekly-stats/route.ts
import { NextResponse } from "next/server";
import { getWeeklyStats } from "@/lib/analytics/analyzer";

export async function GET() {
  try {
    const stats = await getWeeklyStats();
    return NextResponse.json({ stats }, { status: 200 });
  } catch (err) {
    console.error("Error getting weekly stats:", err);
    return NextResponse.json(
      { error: "Kunde inte hämta veckostatistik" },
      { status: 500 }
    );
  }
}

