import { NextResponse } from "next/server";
import { buildStudyPlan, BuildPlanInput, buildMarkdownChecklist } from "@/lib/planEngine";
import { buildPlanWithOrchestrator } from "@/lib/plan/orchestrator";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<BuildPlanInput>;

    // Validate required fields
    if (!body.topic || !body.phase || !body.energy || !body.timeBlock) {
      return NextResponse.json(
        { error: "topic, phase, energy, timeBlock krävs" },
        { status: 400 }
      );
    }

    // Validate ranges
    if (body.phase && (body.phase < 1 || body.phase > 6)) {
      return NextResponse.json(
        { error: "phase must be between 1 and 6" },
        { status: 400 }
      );
    }

    if (body.energy && (body.energy < 1 || body.energy > 5)) {
      return NextResponse.json(
        { error: "energy must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (body.timeBlock && (body.timeBlock < 15 || body.timeBlock > 480)) {
      return NextResponse.json(
        { error: "timeBlock must be between 15 and 480 minutes" },
        { status: 400 }
      );
    }

    const {
      useOrchestrator,
      respectUserInput,
      ...rest
    } = body as BuildPlanInput & { useOrchestrator?: boolean; respectUserInput?: boolean };

    const baseInput: BuildPlanInput = {
      topic: rest.topic,
      phase: rest.phase,
      energy: rest.energy,
      timeBlock: rest.timeBlock,
      deepDiveTopic: rest.deepDiveTopic,
      day: rest.day,
      generateWeekPlan: rest.generateWeekPlan,
      numDays: rest.numDays,
      energyPattern: rest.energyPattern,
      yearDayIndex: rest.yearDayIndex,
    };

    const plan = useOrchestrator === false
      ? await buildStudyPlan(baseInput)
      : await buildPlanWithOrchestrator(baseInput, { respectUserInput });

    const markdown = buildMarkdownChecklist(plan);

    // Spara session i Supabase
    const { data: sessionData, error: sessionError } = await supabaseServer
      .from("study_sessions")
      .insert({
        topic: plan.topic,
        phase: plan.phase,
        energy: plan.energy,
        time_block: plan.timeBlock,
        deep_dive_topic: plan.deepDiveTopicId ?? null,
        deep_dive_day: plan.deepDiveDay ?? null,
        plan,
      })
      .select("id")
      .single();

    if (sessionError) {
      console.error("Error saving session:", sessionError);
      // Fortsätt ändå, session quality kan sparas senare
    }

    return NextResponse.json(
      {
        plan,
        markdown,
        phaseLabel: `Phase ${body.phase}`,
        sessionId: sessionData?.id || null,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Något gick fel när planen genererades." },
      { status: 500 }
    );
  }
}
