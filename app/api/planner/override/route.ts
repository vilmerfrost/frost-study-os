import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prevDayType, newDayType, reason } = body;

    if (!prevDayType || !newDayType) {
      return NextResponse.json(
        { error: "prevDayType och newDayType krävs" },
        { status: 400 }
      );
    }

    // Get user_id from session (for now, we'll use a placeholder - in production, get from auth)
    // TODO: Get actual user_id from Supabase auth session
    const userId = "00000000-0000-0000-0000-000000000000"; // Placeholder

    const { error } = await supabaseServer
      .from("planner_overrides")
      .insert({
        user_id: userId,
        date: new Date().toISOString().split("T")[0],
        prev_day_type: prevDayType,
        new_day_type: newDayType,
        reason: reason || null,
      });

    if (error) {
      console.error("Error saving planner override:", error);
      return NextResponse.json(
        { error: "Kunde inte spara överskrivning" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Error in planner override route:", err);
    return NextResponse.json(
      { error: "Något gick fel" },
      { status: 500 }
    );
  }
}

