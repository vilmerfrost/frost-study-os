import { NextRequest, NextResponse } from "next/server";
import { getWeeklyReport } from "@/lib/analytics/weeklyReport";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    try {
        const report = await getWeeklyReport(userId);
        return NextResponse.json(report);
    } catch (error) {
        console.error("Error fetching weekly report:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
