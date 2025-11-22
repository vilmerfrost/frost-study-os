"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseServer } from "@/lib/supabaseServer";
import { getWeeklyReport } from "@/lib/analytics/weeklyReport";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export interface CoachMessage {
    headline: string;
    message: string;
    toneTag: string;
    suggestedAction: string;
    success: boolean;
}

/**
 * Generate personalized AI coach message based on user data and energy.
 * Speaks in Swedish, addresses Vilmer directly.
 */
export async function generateCoachMessage(
    userId: string,
    mode: string
): Promise<CoachMessage> {
    try {
        // Get recent data
        const weeklyReport = await getWeeklyReport(userId);

        // Get recent reflections
        const { data: reflections } = await supabaseServer
            .from("reflections")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(3);

        // Get energy snapshots
        const { data: energyData } = await supabaseServer
            .from("energy_snapshots")
            .select("*")
            .eq("user_id", userId)
            .order("date", { ascending: false })
            .limit(7);

        const avgEnergy = energyData && energyData.length > 0
            ? energyData.reduce((sum, e) => sum + e.energy, 0) / energyData.length
            : 7;

        const prompt = `You are "Future Vilmer" - Vilmer's wiser, accomplished future self who has mastered ML and built amazing projects. You're supportive, motivating, and speak in Swedish with a personal, encouraging tone.

**Current Data:**
- Total Sessions This Week: ${weeklyReport.totalSessions}
- Hours Logged: ${weeklyReport.totalHours}
- Average Energy: ${avgEnergy.toFixed(1)}/10
- Completion Rate: ${weeklyReport.completionRate}%
- Mode: ${mode}
- Strongest Topics: ${weeklyReport.mostStudiedTopics.join(", ")}
- Weakest Topics: ${weeklyReport.weakestTopics.join(", ")}

**Recent Reflections:**
${reflections?.map(r => `- ${r.content.substring(0, 100)}`).join("\n") || "None"}

**Task:**
Generate a personalized coach message for Vilmer. Include:

1. **Headline** (5-8 words): Catchy, motivating Swedish phrase
2. **Message** (2-3 sentences): Personal insight based on his data
3. **Tone Tag** (single word): excited | supportive | challenging | reflective
4. **Suggested Action** (1 sentence): Specific next step

Be authentic. Reference real data. Speak as "jag" (I - future Vilmer). Use informal Swedish.

Example tone:
- High performance → "Du kör över förväntningarna, Vilmer!"
- Low energy → "Jag vet att det känns tungt nu, men varje steg räknas."
- Balanced → "Du hittar bra balans mellan intensitet och återhämtning."

Return as JSON:
{
  "headline": "string",
  "message": "string",
  "toneTag": "string",
  "suggestedAction": "string"
}`;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.9,
                maxOutputTokens: 512,
            },
        });

        const text = result.response.text();
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
        const parsed = JSON.parse(jsonStr);

        return { ...parsed, success: true };
    } catch (error: any) {
        console.error("Error generating coach message:", error);

        // Fallback message
        return {
            headline: "Fortsätt framåt, Vilmer!",
            message: "Varje session bygger din framtid. Du gör framsteg även när det känns långsamt.",
            toneTag: "supportive",
            suggestedAction: "Starta en fokuserad session idag.",
            success: false,
        };
    }
}
