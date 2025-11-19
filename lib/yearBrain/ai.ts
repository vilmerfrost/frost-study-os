import type { YearDay } from "@/config/yearBrain";

interface YearDayTaskOptions {
  energy: number;
  timeBlockMinutes: number;
  difficulty?: "easy" | "medium" | "hard";
}

const energyNotes: Record<"low" | "medium" | "high", string> = {
  low: "Energin är låg – håll det lätt men ändå meningsfullt.",
  medium: "Stabil energi – kör normal deep dive.",
  high: "Hög energi – våga ta något stretch-mål idag.",
};

export function generateTasksForYearDay(
  yearDay: YearDay,
  options: YearDayTaskOptions
): string[] {
  const level =
    options.energy <= 2 ? "low" : options.energy >= 4 ? "high" : "medium";
  const minutes = Math.max(30, Math.min(options.timeBlockMinutes, 150));

  const tasks: string[] = [
    `📌 Context: ${yearDay.focusArea} (${yearDay.title}). ${energyNotes[level]}`,
  ];

  if (yearDay.type === "deep_dive") {
    tasks.push(
      `🎧 Starta med en 5–10 min recap: skriv ner vad ${yearDay.focusArea} betyder för dig.`,
      `🧠 Gör ett aktivt block (${Math.round(minutes * 0.45)} min): lös eller bygg något som bevisar att du förstår ${yearDay.focusArea}.`,
      `🪄 Skapa 1 konkret exempel eller mini-notebook där du kopplar ${yearDay.focusArea} till Frost/AI-arbete.`,
      `📝 Avsluta med en "teach back": förklara ${yearDay.focusArea} i 5 bullet points.`
    );
  } else if (yearDay.type === "integration") {
    tasks.push(
      `🧾 Review veckan: vilka tre saker fastnade från ${yearDay.focusArea}?`,
      `🪪 Hitta ett knowledge gap och skriv en fråga till framtida dig.`,
      `🛠 Gör en reflektion/summary på max 150 ord om hur ${yearDay.focusArea} kopplar till större mål.`
    );
  } else {
    tasks.push(
      `😴 Recovery: gå en promenad eller gör lätt läsning kopplad till ${yearDay.focusArea} (max 20 min).`,
      `📓 Om du vill: skriv 3 meningar om hur veckan kändes.`,
      `🔥 Förbered mentalt vad du vill fokusera på nästa deep dive-dag.`
    );
  }

  return tasks;
}

