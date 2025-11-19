import { NextResponse } from "next/server";
import { runStudyFlowPlan } from "@/lib/orchestrator/studyFlow";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, phase, energy, timeBlock } = body ?? {};

    if (!topic || !phase || !energy || !timeBlock) {
      return NextResponse.json(
        { error: "topic, phase, energy, timeBlock krävs" },
        { status: 400 }
      );
    }

    const output = await runStudyFlowPlan({
      topic,
      phase: Number(phase),
      energy: Number(energy),
      timeBlock: Number(timeBlock),
    });

    return NextResponse.json({ planText: output }, { status: 200 });
  } catch (err: any) {
    console.error("study-flow error", err);
    return NextResponse.json(
      { error: err.message || "Kunde inte köra study_flow.py" },
      { status: 500 }
    );
  }
}


