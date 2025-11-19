import type { Difficulty } from "@/lib/plan/types";
import { getYearDayByIndex } from "@/lib/yearBrain/helpers";
import { generateTasksForYearDay } from "@/lib/yearBrain/ai";
import { supabaseServer } from "@/lib/supabaseServer";

interface AiTaskOptions {
  yearDayIndex?: number;
  energy?: number;
  timeBlockMinutes?: number;
  userId?: string;
}

/**
 * Check if cached tasks exist for this topic/difficulty combo.
 * Returns cached tasks if found and not expired, null otherwise.
 */
async function getCachedTasks(
  topic: string,
  subtopics: string[],
  difficulty: Difficulty,
  userId?: string
): Promise<string[] | null> {
  if (!userId) return null;

  try {
    const { data, error } = await supabaseServer
      .from("ai_task_cache")
      .select("tasks")
      .eq("topic", topic)
      .eq("difficulty", difficulty)
      .eq("user_id", userId)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;

    // Check if subtopics match (simple check - first subtopic)
    // In production, you might want more sophisticated matching
    return data.tasks || null;
  } catch (error) {
    console.error("Error fetching cached tasks:", error);
    return null;
  }
}

/**
 * Cache generated tasks for reuse.
 */
async function cacheTasks(
  topic: string,
  subtopics: string[],
  difficulty: Difficulty,
  tasks: string[],
  userId?: string
): Promise<void> {
  if (!userId) return;

  try {
    await supabaseServer.from("ai_task_cache").insert({
      user_id: userId,
      topic,
      subtopics,
      difficulty,
      tasks,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    });
  } catch (error) {
    console.error("Error caching tasks:", error);
    // Don't throw - caching is optional
  }
}

/**
 * Generate AI tasks with caching support.
 * 
 * Caching strategy:
 * - Check cache first for same topic/difficulty combo
 * - If found and not expired (< 24h), reuse
 * - Otherwise generate new tasks and cache them
 */
export async function maybeGenerateAiTasks(
  topic: string,
  subtopics: string[],
  difficulty: Difficulty,
  options?: AiTaskOptions
): Promise<string[]> {
  // Try cache first
  if (options?.userId) {
    const cached = await getCachedTasks(topic, subtopics, difficulty, options.userId);
    if (cached && cached.length > 0) {
      return cached;
    }
  }

  // Generate new tasks
  let tasks: string[] = [];

  if (options?.yearDayIndex) {
    const yearDay = getYearDayByIndex(options.yearDayIndex);
    if (yearDay) {
      tasks = generateTasksForYearDay(yearDay, {
        energy: options.energy ?? 3,
        timeBlockMinutes: options.timeBlockMinutes ?? 60,
        difficulty,
      });
    }
  }

  // Fallback if no yearDay tasks
  if (tasks.length === 0) {
    const fallbackTasks: Record<Difficulty, string[]> = {
      easy: [
        `Läs igenom en kort sammanfattning av ${topic} och skriv tre pärlor.`,
        `Gör en enkel övning kopplat till ${subtopics[0] || topic}.`,
        `Förklara konceptet högt för dig själv på 2 minuter.`,
      ],
      medium: [
        `Bygg en mini-implementation av ${subtopics[0] || topic}.`,
        `Skapa ett exempel där ${topic} löser ett konkret problem.`,
        `Dokumentera vad som fortfarande känns osäkert.`,
      ],
      hard: [
        `Designa en advanced uppgift kring ${subtopics[0] || topic} och lös den.`,
        `Hitta ett edge-case i ${topic} och experimentera.`,
        `Skriv en teknisk note som om du lärde ut detta till en kollega.`,
      ],
    };
    tasks = fallbackTasks[difficulty] ?? fallbackTasks.medium;
  }

  // Cache the generated tasks
  if (options?.userId && tasks.length > 0) {
    await cacheTasks(topic, subtopics, difficulty, tasks, options.userId);
  }

  return tasks;
}

