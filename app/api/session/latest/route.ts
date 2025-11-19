// app/api/session/latest/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("study_sessions")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Kunde inte hitta senaste session" },
        { status: 404 }
      );
    }

    return NextResponse.json({ sessionId: data.id }, { status: 200 });
  } catch (err) {
    console.error("Error in latest route:", err);
    return NextResponse.json(
      { error: "Något gick fel" },
      { status: 500 }
    );
  }
}

