import { supabaseServer } from "@/lib/supabaseServer";
import type { ConceptNode } from "@/lib/concepts/concepts";
import type { ConceptMasteryUpdate } from "@/lib/concepts/mastery";
import { updateConceptMastery } from "@/lib/concepts/mastery";
import { ensureReviewItemsForSession } from "@/lib/review/reviewItems";

export interface StudySession {
  id: string;
  user_id: string;
  topic: string;
  phase: number;
  energy: number;
  time_block: number;
  understanding_score?: number | null;
  completion_rate?: number | null;
  reflection?: string | null;
  created_at: string;
  plan?: any;
}

export interface SuggestedReviewItem {
  topic: string;
  subtopic: string;
  reason: string;
}

export interface ReflectionAnalysis {
  struggleKeywords: string[];
  sentiment: "positive" | "neutral" | "negative";
  mainTopic?: string;
}

export interface SessionAnalysisResult {
  masteryUpdate?: ConceptMasteryUpdate;
  suggestedReviews?: SuggestedReviewItem[];
  insightsSummary?: string;
}

/**
 * Analyze a reflection text using simple keyword detection.
 * In production, this could use an LLM for more sophisticated analysis.
 */
async function analyzeReflectionText(reflection: string): Promise<ReflectionAnalysis> {
  const struggleKeywords = [
    "svårt",
    "förstår inte",
    "fastnade",
    "kunde inte",
    "misslyckades",
    "förvirrad",
    "osäker",
    "kämpade",
    "tog lång tid",
    "gick dåligt",
  ];

  const positiveKeywords = [
    "bra",
    "lyckades",
    "förstod",
    "klarade",
    "gick bra",
    "känns bra",
    "tydligt",
    "lätt",
    "bra känsla",
  ];

  const lowerReflection = reflection.toLowerCase();
  const foundStruggles = struggleKeywords.filter((kw) => lowerReflection.includes(kw));
  const foundPositives = positiveKeywords.filter((kw) => lowerReflection.includes(kw));

  let sentiment: "positive" | "neutral" | "negative" = "neutral";
  if (foundStruggles.length > foundPositives.length) {
    sentiment = "negative";
  } else if (foundPositives.length > foundStruggles.length) {
    sentiment = "positive";
  }

  // Extract main topic (simple heuristic: first few words or topic mentions)
  const words = reflection.split(/\s+/).slice(0, 10);
  const mainTopic = words.join(" ");

  return {
    struggleKeywords: foundStruggles,
    sentiment,
    mainTopic: mainTopic.length > 50 ? mainTopic.substring(0, 50) + "..." : mainTopic,
  };
}

/**
 * Optional: Use Ollama for more sophisticated reflection analysis.
 * Falls back to keyword analysis if Ollama is unavailable.
 */
async function analyzeReflectionWithLLM(reflection: string): Promise<ReflectionAnalysis> {
  try {
    const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
    const model = process.env.OLLAMA_MODEL || "llama3";

    const prompt = `Analysera följande studie-reflektion och identifiera:
1. Nyckelord som indikerar svårigheter (svårt, fastnade, osäker, etc.)
2. Sentiment (positive, neutral, negative)
3. Huvudämne/topic som diskuteras

Reflektion: "${reflection}"

Svara med JSON:
{
  "struggleKeywords": ["keyword1", "keyword2"],
  "sentiment": "positive|neutral|negative",
  "mainTopic": "kort sammanfattning"
}`;

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
      }),
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      throw new Error("Ollama request failed");
    }

    const data = await response.json();
    const text = data.response || "";

    // Try to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          struggleKeywords: parsed.struggleKeywords || [],
          sentiment: parsed.sentiment || "neutral",
          mainTopic: parsed.mainTopic,
        };
      } catch {
        // Fall through to keyword analysis
      }
    }
  } catch (error) {
    console.log("LLM analysis failed, using keyword analysis:", error);
  }

  // Fallback to keyword analysis
  return analyzeReflectionText(reflection);
}

/**
 * Analyze a completed study session and update concept mastery + suggest reviews.
 * 
 * This is called after a session is marked as complete with quality metrics.
 */
export async function analyzeCompletedSession(opts: {
  session: StudySession;
  concept: ConceptNode | null;
  userId: string;
}): Promise<SessionAnalysisResult> {
  const { session, concept, userId } = opts;

  if (!concept) {
    // No concept to track, but we can still suggest reviews
    if (session.retention_importance === "high") {
      return {
        suggestedReviews: [
          {
            topic: session.topic,
            subtopic: session.topic,
            reason: "High retention importance marked by user",
          },
        ],
        insightsSummary: "Session completed. Review items will be created if retention importance is high.",
      };
    }
    return {
      insightsSummary: "Session completed. No concept tracking available for this topic.",
    };
  }

  // Analyze reflection if available
  let reflectionAnalysis: ReflectionAnalysis | undefined;
  if (session.reflection && session.reflection.trim().length > 0) {
    // Try LLM first, fallback to keyword analysis
    reflectionAnalysis = await analyzeReflectionWithLLM(session.reflection);
  }

  // Calculate session duration (if available)
  // For now, we'll use time_block as a proxy
  const sessionDurationMs = session.time_block * 60 * 1000; // Convert minutes to ms

  // Update concept mastery
  let masteryUpdate: ConceptMasteryUpdate | undefined;
  try {
    await updateConceptMastery({
      userId,
      conceptId: concept.id,
      understandingScore: session.understanding_score ?? undefined,
      completionRate: session.completion_rate ?? undefined,
      sessionDurationMs,
      reflectionAnalysis,
    });

    masteryUpdate = {
      masteryScore: undefined, // Will be fetched if needed
      struggling: reflectionAnalysis?.sentiment === "negative" || (reflectionAnalysis?.struggleKeywords.length ?? 0) > 2,
    };
  } catch (error) {
    console.error("Error updating concept mastery:", error);
  }

  // Suggest review items if retention is high or reflection indicates confusion
  const suggestedReviews: SuggestedReviewItem[] = [];
  if (session.retention_importance === "high") {
    suggestedReviews.push({
      topic: session.topic,
      subtopic: concept.title,
      reason: "High retention importance",
    });
  }

  if (reflectionAnalysis && reflectionAnalysis.sentiment === "negative" && reflectionAnalysis.struggleKeywords.length > 1) {
    suggestedReviews.push({
      topic: session.topic,
      subtopic: concept.title,
      reason: `Struggling detected: ${reflectionAnalysis.struggleKeywords.slice(0, 3).join(", ")}`,
    });
  }

  // Generate insights summary
  const insightsParts: string[] = [];
  if (session.understanding_score) {
    if (session.understanding_score >= 4) {
      insightsParts.push("Hög förståelse");
    } else if (session.understanding_score <= 2) {
      insightsParts.push("Låg förståelse - överväg extra repetition");
    }
  }

  if (session.completion_rate !== null && session.completion_rate !== undefined) {
    if (session.completion_rate >= 80) {
      insightsParts.push("Hög completion rate");
    } else if (session.completion_rate < 50) {
      insightsParts.push("Låg completion rate - planen kan ha varit för ambitiös");
    }
  }

  if (reflectionAnalysis) {
    if (reflectionAnalysis.sentiment === "positive") {
      insightsParts.push("Positiv reflektion");
    } else if (reflectionAnalysis.sentiment === "negative") {
      insightsParts.push("Negativ reflektion - fokusera på grunderna nästa gång");
    }
  }

  const insightsSummary = insightsParts.length > 0
    ? insightsParts.join(". ") + "."
    : "Session analyserad. Concept mastery uppdaterad.";

  return {
    masteryUpdate,
    suggestedReviews: suggestedReviews.length > 0 ? suggestedReviews : undefined,
    insightsSummary,
  };
}

