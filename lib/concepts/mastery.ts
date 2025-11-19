import { supabaseServer } from "@/lib/supabaseServer";
import type { ConceptNode } from "./concepts";
import { getConceptsForPhase } from "./concepts";

export interface ConceptMastery {
  id: string;
  user_id: string;
  concept_id: string;
  mastery_score: number;
  last_practiced: string | null;
  struggling: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConceptMasteryUpdate {
  masteryScore?: number;
  struggling?: boolean;
  notes?: string;
}

/**
 * Get concept mastery for a user and concept.
 * Returns null if no mastery record exists (defaults to 0).
 */
export async function getConceptMastery(
  userId: string,
  conceptId: string
): Promise<ConceptMastery | null> {
  const { data, error } = await supabaseServer
    .from("concept_mastery")
    .select("*")
    .eq("user_id", userId)
    .eq("concept_id", conceptId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned, which is fine
    console.error("Error fetching concept mastery:", error);
    return null;
  }

  return data || null;
}

/**
 * Get all concept mastery records for a user in a specific phase.
 */
export async function getUserConceptMastery(
  userId: string,
  phase: number
): Promise<ConceptMastery[]> {
  // Get concepts for this phase
  const concepts = getConceptsForPhase(phase);
  const conceptIds = concepts.map((c) => c.id);

  if (conceptIds.length === 0) return [];

  const { data, error } = await supabaseServer
    .from("concept_mastery")
    .select("*")
    .eq("user_id", userId)
    .in("concept_id", conceptIds);

  if (error) {
    console.error("Error fetching user concept mastery:", error);
    return [];
  }

  return data || [];
}

/**
 * Update concept mastery based on session performance.
 * 
 * Mastery update algorithm:
 * - Good session (understanding >= 4, completion >= 80%): +5 mastery, clear struggling flag
 * - Decent session (understanding >= 3, completion >= 60%): +2 mastery
 * - Poor session (understanding <= 2 OR completion < 50%): -3 mastery, set struggling if both are low
 * - Reflection analysis: negative sentiment or many struggle keywords → -2 mastery, set struggling
 * 
 * Mastery score is clamped to 0-100.
 * 
 * @param opts - Session performance data
 * @returns Updated concept mastery record
 */
export async function updateConceptMastery(opts: {
  userId: string;
  conceptId: string;
  understandingScore?: number; // 1-5
  completionRate?: number; // 0-100
  sessionDurationMs?: number;
  reflectionAnalysis?: {
    struggleKeywords: string[];
    sentiment: "positive" | "neutral" | "negative";
    mainTopic?: string;
  };
}): Promise<ConceptMastery> {
  const { userId, conceptId, understandingScore, completionRate, reflectionAnalysis } = opts;

  // Get existing mastery or create default
  let existing = await getConceptMastery(userId, conceptId);
  let currentMastery = existing?.mastery_score ?? 0;
  let struggling = existing?.struggling ?? false;

  // Calculate mastery change based on session performance
  let masteryDelta = 0;

  if (understandingScore !== undefined && completionRate !== undefined) {
    // Good session: understanding >= 4 and completion >= 80%
    if (understandingScore >= 4 && completionRate >= 80) {
      masteryDelta = 5; // Increase mastery
      struggling = false; // Clear struggling flag
    }
    // Decent session: understanding >= 3 and completion >= 60%
    else if (understandingScore >= 3 && completionRate >= 60) {
      masteryDelta = 2;
    }
    // Poor session: understanding <= 2 or completion < 50%
    else if (understandingScore <= 2 || completionRate < 50) {
      masteryDelta = -3; // Decrease mastery
      if (understandingScore <= 2 && completionRate < 50) {
        struggling = true; // Flag as struggling
      }
    }
  }

  // Adjust based on reflection analysis
  if (reflectionAnalysis) {
    if (reflectionAnalysis.sentiment === "negative" || reflectionAnalysis.struggleKeywords.length > 2) {
      masteryDelta -= 2;
      struggling = true;
    } else if (reflectionAnalysis.sentiment === "positive" && reflectionAnalysis.struggleKeywords.length === 0) {
      masteryDelta += 1;
    }
  }

  // Calculate new mastery score (clamped to 0-100)
  const newMastery = Math.max(0, Math.min(100, currentMastery + masteryDelta));

  // Build update object
  const updateData: Partial<ConceptMastery> = {
    mastery_score: newMastery,
    last_practiced: new Date().toISOString(),
    struggling,
  };

  // Update notes if reflection analysis provided main topic
  if (reflectionAnalysis?.mainTopic) {
    const existingNotes = existing?.notes || "";
    const newNote = `[${new Date().toISOString().split("T")[0]}] ${reflectionAnalysis.mainTopic}`;
    updateData.notes = existingNotes ? `${existingNotes}\n${newNote}` : newNote;
  }

  // Upsert the mastery record
  const { data, error } = await supabaseServer
    .from("concept_mastery")
    .upsert(
      {
        user_id: userId,
        concept_id: conceptId,
        ...updateData,
      },
      {
        onConflict: "user_id,concept_id",
      }
    )
    .select()
    .single();

  if (error) {
    console.error("Error updating concept mastery:", error);
    throw new Error(`Failed to update concept mastery: ${error.message}`);
  }

  return data as ConceptMastery;
}

