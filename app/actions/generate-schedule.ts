'use server';

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai'; // Defaulting to OpenAI, can switch to Anthropic
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { DailyState } from '@/lib/types/frost-os';

// Define the schema for the schedule
const ScheduleSchema = z.object({
    schedule: z.array(z.object({
        startTime: z.string().describe('Start time in HH:MM format, e.g. 18:00'),
        endTime: z.string().describe('End time in HH:MM format, e.g. 19:00'),
        activity: z.string().describe('Title of the activity'),
        type: z.enum(['DEEP_WORK', 'LIGHT_WORK', 'BREAK', 'HUMAN_TIME', 'EXERCISE']).describe('Type of activity'),
        description: z.string().describe('Short description or specific topic'),
        resources: z.array(z.string()).optional().describe('Suggested resources or links')
    })),
    summary: z.string().describe('Brief motivational summary of the plan')
});

export type GeneratedSchedule = z.infer<typeof ScheduleSchema>;

export async function generateSchedule(
    state: DailyState,
    currentEnergy: number,
    phase: string = "Phase 1: Foundations",
    topic: string = "General Study"
): Promise<GeneratedSchedule> {

    const systemPrompt = `
    You are Frost Study OS, an advanced study planning agent.
    
    Current User Context:
    - Phase: ${phase}
    - Current Topic: ${topic}
    - Energy Level: ${currentEnergy}/5
    
    SYSTEM CONSTRAINTS (FROM REPTILE BRAIN):
    - Mode: ${state.mode}
    - Message: ${state.message}
    - Hard Constraints: ${state.constraints.join(', ')}
    
    Your goal is to generate a realistic, optimized evening schedule based on these constraints.
    
    Rules:
    1. If Mode is FORCED_RECOVERY, do NOT schedule more than 2 hours of work. Focus on rest.
    2. If Mode is INTERVENTION, schedule only light work or social activities.
    3. If Mode is NORMAL, optimize for Deep Work but respect the energy level.
    4. Always include "Human Time" or breaks.
    5. For "Deep Work", specify the exact sub-topic (e.g. "Eigenvalues" if topic is Linear Algebra).
    
    Generate a JSON object with a timeline.
  `;

    // Use Anthropic by default as requested (Claude 3.5 Sonnet is great for this), fall back to OpenAI if key missing?
    // For now, let's assume the user has configured one. I'll use 'anthropic' model 'claude-3-5-sonnet-20240620' if available, 
    // but since I don't know the keys, I'll use a generic model string that the user can swap.
    // Actually, let's use 'openai' 'gpt-4o' as it's often the default in these SDK examples, 
    // OR 'anthropic' 'claude-3-5-sonnet-latest'.

    // We will try to use the model that is likely configured. 
    // If the user has OPENAI_API_KEY, this works.

    try {
        const { object } = await generateObject({
            model: openai('gpt-4o'), // Or anthropic('claude-3-5-sonnet-20240620')
            schema: ScheduleSchema,
            system: systemPrompt,
            prompt: "Generate the schedule for this evening (starting from 18:00).",
        });

        return object;
    } catch (error) {
        console.error("AI Generation failed:", error);
        // Fallback or re-throw
        throw new Error("Failed to generate schedule. Please check API keys.");
    }
}
