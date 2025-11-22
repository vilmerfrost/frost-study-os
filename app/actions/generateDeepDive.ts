"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseServer } from "@/lib/supabaseServer";
import { getAdaptiveYearDay } from "@/lib/yearBrain/state";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export interface DeepDiveResult {
    whyItMatters: string;
    keyInsights: string[];
    connectionsToPrevious: string;
    success: boolean;
}

/**
 * Generate AI deep dive explanation for today's YearDay.
 * Cached in ai_cache table to avoid redundant API calls.
 */
export async function generateDeepDive(userId: string): Promise<DeepDiveResult> {
    try {
        const yearDay = await getAdaptiveYearDay(userId);
        const cacheKey = `deep_dive_day_${yearDay.dayIndex}`;

        // Check cache first
        const { data: cached } = await supabaseServer
            .from("ai_cache")
            .select("response")
            .eq("cache_key", cacheKey)
            .single();

        if (cached) {
            const parsed = JSON.parse(cached.response);
            return { ...parsed, success: true };
        }

        // Generate new deep dive
        const prompt = `You are an expert ML educator providing context for a 365-day curriculum.

**Today's Focus:**
- Day ${yearDay.dayIndex}/365: ${yearDay.title}
- Focus Area: ${yearDay.focusArea}
- Module: ${yearDay.moduleId}
- Type: ${yearDay.type}

**Task:**
Generate a compelling "Why This Matters" deep dive for the student. Include:

1. **Why It Matters** (2-3 sentences): Explain the real-world importance and applications
2. **Key Insights** (3-4 bullet points): Core concepts to understand today
3. **Connections** (1-2 sentences): How this builds on previous days and prepares for future topics

Be enthusiastic but concise. Use Swedish if appropriate for Vilmer.

Return as JSON:
{
  "whyItMatters": "string",
  "keyInsights": ["insight1", "insight2", "insight3"],
  "connectionsToPrevious": "string"
}`;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 1024,
            },
        });

        const text = result.response.text();
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
        const parsed = JSON.parse(jsonStr);

        // Cache the result (expires in 30 days)
        await supabaseServer.from("ai_cache").insert({
            cache_key: cacheKey,
            prompt_hash: `deep_dive_${yearDay.dayIndex}`,
            response: JSON.stringify(parsed),
            model: "gemini-1.5-pro",
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });

        return { ...parsed, success: true };
    } catch (error: any) {
        console.error("Error generating deep dive:", error);

        // Fallback response
        return {
            whyItMatters: "This topic builds your foundation in machine learning.",
            keyInsights: [
                "Focus on understanding core concepts",
                "Practice through examples",
                "Connect to real-world applications",
            ],
            connectionsToPrevious: "Builds on previous learning.",
            success: false,
        };
    }
}
