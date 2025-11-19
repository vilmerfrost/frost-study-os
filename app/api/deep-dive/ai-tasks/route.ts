import { NextResponse } from "next/server";
import { getYearDayByIndex } from "@/lib/yearBrain/helpers";
import { generateTasksForYearDay } from "@/lib/yearBrain/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const dayIndex = Number(body.dayIndex);
    const energy = Number(body.energy ?? 3);
    const timeBlockMinutes = Number(body.timeBlockMinutes ?? 60);

    if (!dayIndex || Number.isNaN(dayIndex)) {
      return NextResponse.json(
        { error: "dayIndex krävs" },
        { status: 400 }
      );
    }

    const yearDay = getYearDayByIndex(dayIndex);
    if (!yearDay) {
      return NextResponse.json(
        { error: "YearDay saknas" },
        { status: 404 }
      );
    }

    const tasks = generateTasksForYearDay(yearDay, {
      energy,
      timeBlockMinutes,
    });

    return NextResponse.json(
      {
        tasks,
        meta: {
          dayIndex,
          title: yearDay.title,
          focusArea: yearDay.focusArea,
          goals: yearDay.goals,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("deep-dive ai tasks error:", err);
    return NextResponse.json(
      { error: "Kunde inte generera tasks" },
      { status: 500 }
    );
  }
}

