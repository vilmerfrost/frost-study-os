import { supabaseServer } from "@/lib/supabaseServer";
import { applySm2, initialSm2State } from "@/lib/srs/sm2";

export interface ReviewItem {
  id: string;
  topic: string;
  subtopic: string;
  last_review_at: string | null;
  next_review_at: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  created_from_session_id?: string | null;
}

export async function getDueReviewItems(limit = 3): Promise<ReviewItem[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabaseServer
    .from("review_items")
    .select("*")
    .lte("next_review_at", now)
    .order("next_review_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Error fetching review items:", error);
    return [];
  }

  return data || [];
}

export async function ensureReviewItemsForSession(sessionId: string) {
  const { data: session, error } = await supabaseServer
    .from("study_sessions")
    .select("topic, plan")
    .eq("id", sessionId)
    .single();

  if (error || !session) {
    console.error("Could not load session for review items", error);
    return;
  }

  const plan = session.plan as any;
  let subtopics: string[] =
    plan?.deepDiveSubtopics && Array.isArray(plan.deepDiveSubtopics)
      ? plan.deepDiveSubtopics
      : [];

  if (!subtopics.length && plan?.blocks) {
    subtopics = [session.topic];
  }

  if (!subtopics.length) {
    subtopics = [session.topic];
  }

  subtopics = Array.from(new Set(subtopics));

  const { data: existing } = await supabaseServer
    .from("review_items")
    .select("subtopic")
    .eq("topic", session.topic)
    .in("subtopic", subtopics);

  const existingSubtopics = new Set(existing?.map((item) => item.subtopic) || []);
  const itemsToInsert = subtopics
    .filter((sub) => !existingSubtopics.has(sub))
    .map((subtopic) => {
      const initial = initialSm2State();
      const nextReviewAt = new Date();
      nextReviewAt.setDate(nextReviewAt.getDate() + initial.intervalDays);

      return {
        topic: session.topic,
        subtopic,
        ease_factor: initial.easeFactor,
        interval_days: initial.intervalDays,
        repetitions: initial.repetitions,
        last_review_at: null,
        next_review_at: nextReviewAt.toISOString(),
        created_from_session_id: sessionId,
      };
    });

  if (!itemsToInsert.length) return;

  const { error: insertError } = await supabaseServer
    .from("review_items")
    .insert(itemsToInsert);

  if (insertError) {
    console.error("Error inserting review items:", insertError);
  }
}

export async function completeReviewItem(reviewItemId: string, quality: number) {
  const { data, error } = await supabaseServer
    .from("review_items")
    .select(
      "id, topic, subtopic, ease_factor, interval_days, repetitions, next_review_at"
    )
    .eq("id", reviewItemId)
    .single();

  if (error || !data) {
    throw new Error("Review item hittades inte");
  }

  const result = applySm2(
    {
      easeFactor: data.ease_factor,
      intervalDays: data.interval_days,
      repetitions: data.repetitions,
      nextReviewAt: data.next_review_at,
    },
    quality
  );

  const { error: updateError } = await supabaseServer
    .from("review_items")
    .update({
      ease_factor: result.easeFactor,
      interval_days: result.intervalDays,
      repetitions: result.repetitions,
      last_review_at: new Date().toISOString(),
      next_review_at: result.nextReviewAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", reviewItemId);

  if (updateError) {
    console.error("Error updating review item:", updateError);
    throw new Error("Kunde inte uppdatera review item");
  }
}

