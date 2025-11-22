"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export interface SentimentResult {
    sentiment: "positive" | "neutral" | "negative";
    themes: string[];
    summary: string;
}

/**
 * Analyze sentiment and themes from user reflection text.
 */
export async function analyzeSentiment(text: string): Promise<SentimentResult> {
    if (!text || text.trim().length < 10) {
        return {
            sentiment: "neutral",
            themes: [],
            summary: "Too short to analyze.",
        };
    }

    try {
        const prompt = `Analyze this study reflection and extract:

1. **Sentiment**: positive | neutral | negative
2. **Themes**: 2-4 key themes/topics mentioned
3. **Summary**: One sentence summary

Reflection: "${text}"

Return JSON:
{
  "sentiment": "positive|neutral|negative",
  "themes": ["theme1", "theme2"],
  "summary": "string"
}`;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 256,
            },
        });

        const responseText = result.response.text();
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;
        const parsed = JSON.parse(jsonStr);

        return parsed;
    } catch (error) {
        console.error("Error analyzing sentiment:", error);

        // Simple fallback analysis
        const lowerText = text.toLowerCase();
        const positiveWords = ["bra", "excellent", "good", "lyckades", "förstod", "klar"];
        const negativeWords = ["svårt", "difficult", "struggled", "fastnade", "förvirrad"];

        const positiveCount = positiveWords.filter(w => lowerText.includes(w)).length;
        const negativeCount = negativeWords.filter(w => lowerText.includes(w)).length;

        let sentiment: "positive" | "neutral" | "negative" = "neutral";
        if (positiveCount > negativeCount) sentiment = "positive";
        else if (negativeCount > positiveCount) sentiment = "negative";

        return {
            sentiment,
            themes: ["reflection"],
            summary: text.substring(0, 100),
        };
    }
}
