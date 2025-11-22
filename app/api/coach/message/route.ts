import { NextRequest, NextResponse } from "next/server";
import { getFutureVilmerMessage } from "@/lib/coach/futureVilmer";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const mode = searchParams.get("mode") || "balanced";

    if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    try {
        const message = await getFutureVilmerMessage(userId, mode);
        return NextResponse.json(message);
    } catch (error) {
        console.error("Error fetching coach message:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
