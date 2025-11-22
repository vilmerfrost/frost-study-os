"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseServer } from "@/lib/supabaseServer";
import { getAdaptiveYearDay } from "@/lib/yearBrain/state";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export interface GeneratePlanInput {
    userId: string;
    energy: number; // 1-10
    timeAvailable: number; // minutes
    mode: "beast" | "balanced" | "recovery" | "soft";
}

export interface StudyBlock {
    type: string;
    duration: number;
    description: string;
    tasks: string[];
}

export interface GeneratePlanResult {
    planId: string;
    blocks: StudyBlock[];
    agentLogs: any[];
    success: boolean;
    error?: string;
}

/**
 * Generate an AI-powered study plan using Gemini.
 * Uses multi-agent pipeline concept with structured output.
 */
export async function generatePlan(
    input: GeneratePlanInput
): Promise<GeneratePlanResult> {
    const startTime = Date.now();
    const agentLogs: any[] = [];

    try {
        // 1. Get YearDay context
        const yearDay = await getAdaptiveYearDay(input.userId);
        agentLogs.push({
            agent: "Analyzer",
            status: "complete",
            data: { yearDay, energy: input.energy, timeAvailable: input.timeAvailable },
        });

        // 2. Build Gemini prompt
        const prompt = `You are an expert study planner for a 365-day Machine Learning curriculum.

**Current Context:**
- Day ${yearDay.dayIndex}/365 - ${yearDay.title}
- Focus Area: ${yearDay.focusArea}
- Module: ${yearDay.moduleId}
- Phase: ${yearDay.phase}

**User State:**
- Energy Level: ${input.energy}/10
- Time Available: ${input.timeAvailable} minutes
- Mode: ${input.mode}

**Mode Guidelines:**
- **Beast**: Aggressive, intense deep work. Favor complex problems and deep learning.
- **Balanced**: Mix of learning, practice, and review. Well-rounded.
- **Recovery**: Lighter load. Review, reading, reflection. No intense problem-solving.
- **Soft**: Minimal cognitive load. Videos, reading, light practice.

**Instructions:**
Generate a structured study plan as a JSON array of study blocks. Each block should have:
- type: "Warmup" | "Deep Work" | "Practice" | "Review" | "Reflection" | "Break"
- duration: number (minutes)
- description: string (specific, actionable description)
- tasks: string[] (2-4 micro-tasks)

**Rules:**
1. Total duration should equal ${input.timeAvailable} minutes (±5 min ok)
2. Always include a Warmup (5-10 min) and Reflection (5-10 min)
3. Respect energy level: Low energy (1-4) = more review/reading. High energy (7-10) = more deep work.
4. Mode affects intensity and block types
5. Tasks should be specific to today's YearDay content
6. Include short breaks (5 min) after 45-60 min blocks

Return ONLY valid JSON in this format:
{
  "blocks": [
    {
      "type": "Warmup",
      "duration": 10,
      "description": "Review yesterday's notes on eigenvectors",
      "tasks": ["Open notebook", "Skim key definitions", "Write 3 recall questions"]
    }
  ]
}`;

        agentLogs.push({
            agent: "Tutor",
            status: "generating",
            prompt: prompt.substring(0, 200) + "...",
        });

        // 3. Call Gemini
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            },
        });

        const response = result.response;
        const text = response.text();

        agentLogs.push({
            agent: "Planner",
            status: "parsing",
            rawResponse: text.substring(0, 200) + "...",
        });

        // 4. Parse JSON response
        let parsedBlocks: StudyBlock[] = [];
        try {
            // Extract JSON from markdown code blocks if present
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
            const parsed = JSON.parse(jsonStr);
            parsedBlocks = parsed.blocks || parsed;
        } catch (parseError) {
            console.error("Failed to parse Gemini response:", parseError);
            // Fallback: Create a simple plan
            parsedBlocks = createFallbackPlan(input, yearDay);
        }

        agentLogs.push({
            agent: "TaskGenerator",
            status: "complete",
            blocksGenerated: parsedBlocks.length,
        });

        // 5. Save to database
        const { data: plan, error: dbError } = await supabaseServer
            .from("session_plans")
            .insert({
                user_id: input.userId,
                year_day: yearDay.dayIndex,
                energy: input.energy,
                time_available: input.timeAvailable,
                mode: input.mode,
                blocks: parsedBlocks,
                agent_logs: agentLogs,
                generation_time_ms: Date.now() - startTime,
                status: "generated",
            })
            .select()
            .single();

        if (dbError) {
            console.error("Database error:", dbError);
            throw new Error(`Failed to save plan: ${dbError.message}`);
        }

        return {
            planId: plan.id,
            blocks: parsedBlocks,
            agentLogs,
            success: true,
        };
    } catch (error: any) {
        console.error("Error generating plan:", error);

        // Fallback plan on error
        const yearDay = await getAdaptiveYearDay(input.userId);
        const fallbackBlocks = createFallbackPlan(input, yearDay);

        // Try to save fallback plan
        const { data: plan } = await supabaseServer
            .from("session_plans")
            .insert({
                user_id: input.userId,
                year_day: yearDay.dayIndex,
                energy: input.energy,
                time_available: input.timeAvailable,
                mode: input.mode,
                blocks: fallbackBlocks,
                agent_logs: [{ error: error.message }],
                generation_time_ms: Date.now() - startTime,
                status: "generated",
            })
            .select()
            .single();

        return {
            planId: plan?.id || "fallback",
            blocks: fallbackBlocks,
            agentLogs: [],
            success: false,
            error: error.message,
        };
    }
}

/**
 * Create a simple fallback plan if AI fails
 */
function createFallbackPlan(input: GeneratePlanInput, yearDay: any): StudyBlock[] {
    const blocks: StudyBlock[] = [];
    let remaining = input.timeAvailable;

    // Warmup
    blocks.push({
        type: "Warmup",
        duration: 10,
        description: "Review yesterday's notes and prepare mindset",
        tasks: ["Open materials", "Quick review", "Set intention"],
    });
    remaining -= 10;

    // Main work block
    const mainDuration = Math.min(remaining - 15, 45);
    blocks.push({
        type: input.energy >= 7 ? "Deep Work" : "Review",
        duration: mainDuration,
        description: `Study ${yearDay.focusArea}`,
        tasks: ["Read material", "Take notes", "Solve problems"],
    });
    remaining -= mainDuration;

    // Practice or reflection
    if (remaining > 15) {
        blocks.push({
            type: "Practice",
            duration: remaining - 10,
            description: "Apply concepts through practice problems",
            tasks: ["Choose problems", "Work through solutions", "Check understanding"],
        });
        remaining = 10;
    }

    // Reflection
    blocks.push({
        type: "Reflection",
        duration: remaining,
        description: "Reflect on session and plan next steps",
        tasks: ["What did I learn?", "What was challenging?", "Next session goals"],
    });

    return blocks;
}
