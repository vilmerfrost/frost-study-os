import type {
  StudyPlan,
  StudyBlock,
  DayPlan,
  DayType,
  BuildPlanInput,
  PlanReasoning,
} from "@/lib/plan/types";
import { determineDayType, getTimeBlockForDayType } from "@/lib/plan/dayTypes";
import { findDeepDiveDayConfig } from "@/lib/plan/deepDives";
import { maybeGenerateAiTasks } from "@/lib/plan/aiTasks";
import { deepDiveConfigs } from "@/lib/config/deepDives";
import { calculateDifficulty } from "@/lib/plan/adaptiveDifficulty";
import { getConceptMastery } from "@/lib/concepts/mastery";
import { getConceptForYearDay } from "@/lib/concepts/concepts";
import { getYearDayByIndex } from "@/lib/yearBrain/helpers";

function chooseProfile(energy: number, timeBlock: number): StudyPlan["profile"] {
  if (energy <= 2) return "minimum";
  if (energy === 3) return "normal";
  return "beast";
}

function chooseIntensity(energy: number): 1 | 2 | 3 {
  if (energy <= 2) return 1;
  if (energy === 3) return 2;
  return 3;
}

function suggestNotebookLMPack(phase: number, topic: string): string {
  const t = topic.toLowerCase();
  if (phase === 1) {
    if (t.includes("prob") || t.includes("stat")) return "Phase1_Prob_Pack";
    if (t.includes("regression") || t.includes("ml") || t.includes("model")) {
      return "Phase1_ML_Intro_Pack";
    }
    return "Phase1_LA_Pack";
  }
  if (phase === 2) {
    if (t.includes("cnn") || t.includes("vision")) return "Phase2_CV_Pack";
    return "Phase2_DL_Core";
  }
  if (phase === 3) {
    if (t.includes("rag") || t.includes("retrieval")) return "Phase3_RAG_Pack";
    if (t.includes("agent")) return "Phase3_Agents_Pack";
    return "Phase3_LLM_Core";
  }
  if (phase === 4) return "Phase4_Specialization_Pack";
  return "General_AI_Pack";
}

async function buildSingleDayPlan(
  topic: string,
  phase: number,
  energy: number,
  timeBlock: number,
  dayType: DayType,
  deepDiveDayConfig?: (typeof deepDiveConfigs)[string]["days"][number],
  dayNumber?: number,
  opts?: { yearDayIndex?: number; userId?: string; conceptId?: string }
): Promise<{ blocks: StudyBlock[]; profile: StudyPlan["profile"]; difficultyDecision?: { level: "easy" | "medium" | "hard"; reasoning: string } }> {
  const profile = chooseProfile(energy, timeBlock);

  // Fetch concept mastery if available
  let conceptMastery: number | undefined;
  let recentlyStruggling = false;
  if (opts?.userId && opts?.conceptId) {
    try {
      const mastery = await getConceptMastery(opts.userId, opts.conceptId);
      if (mastery) {
        conceptMastery = mastery.mastery_score;
        recentlyStruggling = mastery.struggling;
      }
    } catch (error) {
      console.error("Error fetching concept mastery:", error);
      // Continue without mastery data
    }
  }

  let ratios = [0.2, 0.4, 0.3, 0.1];
  if (profile === "minimum" || dayType === "minimum" || dayType === "recovery") {
    ratios = [0.35, 0.35, 0.0, 0.3];
  } else if (profile === "beast" && dayType === "beast") {
    ratios = [0.15, 0.3, 0.45, 0.1];
  }

  // Adjust ratios if struggling
  if (recentlyStruggling) {
    ratios = [0.3, 0.4, 0.2, 0.1]; // More theory, less exercises
  }

  if (deepDiveDayConfig) {
    const m = deepDiveDayConfig.defaultBlockMix;
    ratios = [m.notebooklm ?? ratios[0], m.theory ?? ratios[1], m.exercises ?? ratios[2], m.summary ?? ratios[3]];
  }

  const total = timeBlock;
  let durations = ratios.map((r) => Math.max(0, Math.round((total * r) / 5) * 5));

  while (durations.reduce((a, b) => a + b, 0) > total) {
    for (let i = 0; i < durations.length; i++) {
      if (durations.reduce((a, b) => a + b, 0) <= total) break;
      if (durations[i] >= 5) durations[i] -= 5;
    }
  }

  const nbSource = suggestNotebookLMPack(phase, topic);
  const tasksByType = deepDiveDayConfig?.tasks ?? {};

  const blocks: StudyBlock[] = [];

  if (durations[0] > 0) {
    blocks.push({
      type: "notebooklm",
      duration: durations[0],
      description: `Lyssna på NotebookLM-podd eller läs ur ${nbSource}.`,
      goal: `Kom in i ämnet '${topic}' utan press.`,
      notebooklmSource: nbSource,
      tasks: tasksByType.notebooklm,
    });
  }

  if (durations[1] > 0) {
    blocks.push({
      type: "theory",
      duration: durations[1],
      description: "Jobba aktivt med teori: anteckningar, bok, eller be en LLM förklara på din nivå.",
      goal: `Förstå grunderna i '${topic}' bättre.`,
      tasks: tasksByType.theory,
    });
  }

  if (durations[2] > 0 && !(dayType === "recovery" && energy <= 1)) {
    // Use adaptive difficulty
    const difficultyDecision = calculateDifficulty({
      conceptMastery,
      energy,
      recentlyStruggling,
      phase,
    });

    const aiTasks = deepDiveDayConfig
      ? await maybeGenerateAiTasks(topic, deepDiveDayConfig.subtopics, difficultyDecision.level, {
          yearDayIndex: opts?.yearDayIndex,
          energy,
          timeBlockMinutes: timeBlock,
          userId: opts?.userId,
        })
      : [];

    blocks.push({
      type: "exercises",
      duration: durations[2],
      description: "Lös konkreta uppgifter (för hand, i kod eller med LLM som tutor).",
      goal: `Testa dig själv på '${topic}' med ca 3–6 uppgifter.`,
      level: difficultyDecision.level,
      tasks: tasksByType.exercises,
      aiGeneratedTasks: aiTasks.length ? aiTasks : undefined,
    });

    // Store difficulty decision for reasoning
    if (durations[3] > 0) {
      blocks.push({
        type: "summary",
        duration: durations[3],
        description: "Skriv kort vad du gjorde, vad som var svårt och vad du ska göra nästa gång.",
        goal: "Stäng loopen så hjärnan fattar att passet är klart.",
        tasks: tasksByType.summary,
      });
    }
    return { blocks, profile, difficultyDecision };
  }

  if (durations[3] > 0) {
    blocks.push({
      type: "summary",
      duration: durations[3],
      description: "Skriv kort vad du gjorde, vad som var svårt och vad du ska göra nästa gång.",
      goal: "Stäng loopen så hjärnan fattar att passet är klart.",
      tasks: tasksByType.summary,
    });
  }

  return { blocks, profile };
}

/**
 * Generate reasoning for a study plan.
 */
function generateReasoning(
  dayType: DayType,
  energy: number,
  topic: string,
  phase: number,
  previousDayTypes: DayType[],
  consecutiveBeastDays: number,
  difficultyDecision?: { level: "easy" | "medium" | "hard"; reasoning: string },
  conceptMastery?: number,
  recentlyStruggling?: boolean
): PlanReasoning {
  const dayTypeLabels: Record<DayType, string> = {
    minimum: "Minimum day – låg energi, fokus på grunderna",
    normal: "Normal day – max 3h fokus",
    beast: "Beast day – hög energi, max 5h fokus",
    recovery: "Recovery day – vila och lätt reflektion",
  };

  const energyLabels: Record<number, string> = {
    1: "Mycket låg energi",
    2: "Låg energi",
    3: "Normal energi",
    4: "Hög energi",
    5: "Mycket hög energi",
  };

  const safetyRules: string[] = [];
  if (consecutiveBeastDays >= 3) {
    safetyRules.push("3+ Beast-dagar i rad → auto-soft week");
  }
  if (previousDayTypes.slice(-3).filter((d) => d === "minimum" || d === "recovery").length >= 3) {
    safetyRules.push("3+ låg-energi dagar → recovery rekommenderas");
  }

  let blockMix = "Standard block-mix";
  if (recentlyStruggling) {
    blockMix = `Extra theory block pga struggle tidigare`;
  } else if (conceptMastery !== undefined && conceptMastery < 50) {
    blockMix = `Extra theory block (mastery ${conceptMastery}%)`;
  } else if (conceptMastery !== undefined && conceptMastery >= 75) {
    blockMix = `Extra exercises block (mastery ${conceptMastery}%)`;
  }

  let tasksFocus = `Fokus på ${topic}`;
  if (conceptMastery !== undefined) {
    tasksFocus = `Fokus på ${topic} (mastery ${conceptMastery}%)`;
  }

  return {
    dayType: dayTypeLabels[dayType] || dayType,
    energyLabel: energyLabels[energy] || `Energi ${energy}`,
    blockMix,
    tasksFocus,
    safetyRules,
    difficultyReasoning: difficultyDecision?.reasoning,
  };
}

export async function buildStudyPlan(input: BuildPlanInput & { userId?: string }): Promise<StudyPlan> {
  const { topic, phase, energy, timeBlock, generateWeekPlan, numDays, energyPattern, userId } = input;

  // Get concept for mastery lookup
  let conceptId: string | undefined;
  let conceptMastery: number | undefined;
  let recentlyStruggling = false;
  if (userId && input.yearDayIndex) {
    try {
      const yearDay = getYearDayByIndex(input.yearDayIndex);
      if (yearDay) {
        const concept = getConceptForYearDay(yearDay);
        if (concept) {
          conceptId = concept.id;
          const mastery = await getConceptMastery(userId, concept.id);
          if (mastery) {
            conceptMastery = mastery.mastery_score;
            recentlyStruggling = mastery.struggling;
          }
        }
      }
    } catch (error) {
      console.error("Error fetching concept for reasoning:", error);
    }
  }

  if (generateWeekPlan && numDays && numDays > 1) {
    const dayPlans: DayPlan[] = [];
    const previousDayTypes: DayType[] = [];
    let consecutiveBeastDays = 0;

    const energies = energyPattern || Array.from({ length: numDays }, (_, i) => {
      if (i === 0) return energy;
      if (i % 3 === 0) return Math.max(2, energy - 1);
      if (i % 4 === 0) return Math.min(5, energy + 1);
      return energy;
    });

    let firstDayDifficulty: { level: "easy" | "medium" | "hard"; reasoning: string } | undefined;

    for (let i = 0; i < numDays; i++) {
      const dayEnergy = energies[i] || energy;
      const dayType = determineDayType(dayEnergy, previousDayTypes, consecutiveBeastDays);

      if (dayType === "beast") {
        consecutiveBeastDays++;
      } else {
        consecutiveBeastDays = 0;
      }

      const adjustedTimeBlock = getTimeBlockForDayType(dayType, timeBlock);

      const deepDiveDay = input.deepDiveTopic && input.day ? ((input.day - 1 + i) % 6) + 1 : input.day;

      const deepDiveDayConfig = findDeepDiveDayConfig(topic, phase, input.deepDiveTopic, deepDiveDay);

      const { blocks, profile, difficultyDecision } = await buildSingleDayPlan(
        topic,
        phase,
        dayEnergy,
        adjustedTimeBlock,
        dayType,
        deepDiveDayConfig,
        i + 1,
        { 
          yearDayIndex: input.yearDayIndex ? input.yearDayIndex + i : undefined,
          userId,
          conceptId,
        }
      );

      if (i === 0) {
        firstDayDifficulty = difficultyDecision;
      }

      const date = new Date();
      date.setDate(date.getDate() + i);

      dayPlans.push({
        day: i + 1,
        dayType,
        energy: dayEnergy,
        timeBlock: adjustedTimeBlock,
        blocks,
        date: date.toISOString().split("T")[0],
        notes:
          dayType === "recovery"
            ? "Recovery day - lätt lärande, promenad, sömn. Ingen heavy bygg."
            : dayType === "minimum" && consecutiveBeastDays >= 3
            ? "Minimum day efter 3+ Beast-dagar - vila upp."
            : undefined,
      });

      previousDayTypes.push(dayType);
    }

    const reasoning = generateReasoning(
      dayPlans[0]?.dayType || "normal",
      energy,
      topic,
      phase,
      previousDayTypes,
      consecutiveBeastDays,
      firstDayDifficulty,
      conceptMastery,
      recentlyStruggling
    );

    return {
      topic,
      phase,
      energy,
      timeBlock,
      profile: chooseProfile(energy, timeBlock),
      intensityLevel: chooseIntensity(energy),
      dayType: dayPlans[0]?.dayType,
      deepDiveMode: !!input.deepDiveTopic,
      deepDiveTopicId: input.deepDiveTopic,
      deepDiveDay: input.day,
      deepDiveName: dayPlans[0]?.blocks.length ? "Week Plan" : undefined,
      blocks: dayPlans[0]?.blocks || [],
      isWeekPlan: true,
      dayPlans,
      reasoning,
    };
  }

  const profile = chooseProfile(energy, timeBlock);
  const intensityLevel = chooseIntensity(energy);

  const deepDiveDayConfig = findDeepDiveDayConfig(topic, phase, input.deepDiveTopic, input.day);

  const dayType = determineDayType(energy);
  const { blocks, difficultyDecision } = await buildSingleDayPlan(
    topic,
    phase,
    energy,
    timeBlock,
    dayType,
    deepDiveDayConfig,
    input.day,
    { 
      yearDayIndex: input.yearDayIndex,
      userId,
      conceptId,
    }
  );

  const reasoning = generateReasoning(
    dayType,
    energy,
    topic,
    phase,
    [],
    0,
    difficultyDecision,
    conceptMastery,
    recentlyStruggling
  );

  return {
    topic,
    phase,
    energy,
    timeBlock,
    profile,
    intensityLevel,
    dayType,
    deepDiveMode: !!deepDiveDayConfig,
    deepDiveTopicId: deepDiveDayConfig ? input.deepDiveTopic || topic : undefined,
    deepDiveDay: deepDiveDayConfig?.day,
    deepDiveName: deepDiveDayConfig?.name,
    deepDiveSubtopics: deepDiveDayConfig?.subtopics,
    deepDiveWhy: deepDiveDayConfig?.why,
    blocks,
    isWeekPlan: false,
    reasoning,
  };
}

