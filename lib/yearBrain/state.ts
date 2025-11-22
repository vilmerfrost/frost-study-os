import { createClient } from "@supabase/supabase-js";
import { yearBrain, YearDay } from "../../config/yearBrain";

// Initialize Supabase client (ensure env vars are set)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export type YearDayWithContext = YearDay & {
    context: {
        isAdaptive: boolean;
        reasoning: string;
        recommendedFocus?: string[];
        mode: "beast" | "balanced" | "soft" | "recovery";
    };
};

export async function getAdaptiveYearDay(userId: string): Promise<YearDayWithContext> {
    // 1. Fetch user settings
    const { data: settings, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", userId)
        .single();

    // Default to day 1 if no settings found
    const currentDayIndex = settings?.current_day_index || 1;
    const mode = settings?.preferred_mode || "balanced";

    // 2. Get base day from config
    // Note: dayIndex is 1-based in config
    const baseDay = yearBrain.days.find((d) => d.dayIndex === currentDayIndex);

    if (!baseDay) {
        throw new Error(`YearDay config missing for index ${currentDayIndex}`);
    }

    // 3. Fetch recent sessions for context (last 7 days)
    const { data: recentSessions } = await supabase
        .from("study_sessions")
        .select("topic, completion_rate, reflection")
        .eq("user_id", userId)
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    // 4. Simple adaptive logic (can be expanded with agents later)
    let adaptiveReasoning = "Following standard YearBrain schedule.";
    let recommendedFocus = baseDay.goals;

    if (mode === "recovery") {
        adaptiveReasoning = "Recovery mode active. Reducing intensity.";
        recommendedFocus = ["Light review", "Rest & Reflection"];
    } else if (mode === "beast") {
        adaptiveReasoning = "Beast mode active. Increasing intensity.";
        recommendedFocus = [...baseDay.goals, "Extra challenge problem"];
    }

    // Check for weak topics in recent sessions
    if (recentSessions && recentSessions.length > 0) {
        const lowScoreSessions = recentSessions.filter((s) => s.completion_rate < 0.6);
        if (lowScoreSessions.length > 0) {
            adaptiveReasoning += ` Detected struggle with recent topics. Adding review buffer.`;
            // In a real adaptive system, we might swap the topic here.
            // For now, we just append a note.
        }
    }

    return {
        ...baseDay,
        context: {
            isAdaptive: true,
            reasoning: adaptiveReasoning,
            recommendedFocus,
            mode,
        },
    };
}

export async function advanceYearDay(userId: string): Promise<void> {
    const { data: settings } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", userId)
        .single();

    if (!settings) return;

    const nextIndex = settings.current_day_index + 1;
    if (nextIndex > 365) return; // Cap at 365

    await supabase
        .from("user_settings")
        .update({
            current_day_index: nextIndex,
            last_advanced_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
}
