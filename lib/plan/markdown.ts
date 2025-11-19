import type { StudyPlan } from "@/lib/plan/types";

export function buildMarkdownChecklist(plan: StudyPlan): string {
  const lines: string[] = [];

  if (plan.isWeekPlan && plan.dayPlans) {
    lines.push(`# Veckoplan – ${plan.topic}`);
    lines.push("");
    lines.push(`**Phase:** ${plan.phase}`);
    if (plan.deepDiveMode) {
      lines.push(`**Deep dive:** ${plan.deepDiveTopicId}`);
    }
    lines.push("");
    lines.push(`**Antal dagar:** ${plan.dayPlans.length}`);
    lines.push("");

    for (const dayPlan of plan.dayPlans) {
      const dateStr = dayPlan.date
        ? new Date(dayPlan.date).toLocaleDateString("sv-SE", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })
        : `Dag ${dayPlan.day}`;

      lines.push(`## ${dateStr} – ${dayPlan.dayType.toUpperCase()}`);
      lines.push(`**Energi:** ${dayPlan.energy}/5 | **Tid:** ${dayPlan.timeBlock} min`);
      if (dayPlan.notes) {
        lines.push(`*${dayPlan.notes}*`);
      }
      lines.push("");

      for (const block of dayPlan.blocks) {
        lines.push(`- [ ] **${block.type.toUpperCase()}** – ${block.duration} min`);
        if (block.description) {
          lines.push(`  - ${block.description}`);
        }
        if (block.tasks && block.tasks.length) {
          for (const t of block.tasks) {
            lines.push(`  - [ ] ${t}`);
          }
        }
        if (block.aiGeneratedTasks && block.aiGeneratedTasks.length) {
          lines.push(`  - 🤖 Extra övningar:`);
          for (const t of block.aiGeneratedTasks) {
            lines.push(`    - [ ] ${t}`);
          }
        }
        lines.push("");
      }
      lines.push("---");
      lines.push("");
    }
  } else {
    lines.push(`# Study Session – ${plan.topic}`);
    lines.push("");

    lines.push(`**Phase:** ${plan.phase}`);
    if (plan.deepDiveMode && plan.deepDiveName) {
      lines.push(`**Deep dive:** Dag ${plan.deepDiveDay} – ${plan.deepDiveName}`);
    }
    lines.push("");

    for (const block of plan.blocks) {
      lines.push(`- [ ] **${block.type.toUpperCase()}** – ${block.duration} min`);
      if (block.description) {
        lines.push(`  - ${block.description}`);
      }
      if (block.tasks && block.tasks.length) {
        for (const t of block.tasks) {
          lines.push(`  - [ ] ${t}`);
        }
      }
      if (block.aiGeneratedTasks && block.aiGeneratedTasks.length) {
        lines.push(`  - 🤖 Extra övningar:`);
        for (const t of block.aiGeneratedTasks) {
          lines.push(`    - [ ] ${t}`);
        }
      }
      lines.push("");
    }
  }

  lines.push("---");
  lines.push(
    "_Logga efter passet: skriv 2–3 meningar om vad du gjorde, vad som var svårt, och vad nästa steg är._"
  );

  return lines.join("\n");
}

