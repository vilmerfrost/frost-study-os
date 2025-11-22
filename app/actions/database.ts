"use server";

import { supabaseServer } from "@/lib/supabaseServer";

export interface SaveSessionInput {
    userId: string;
    planId: string;
    topic: string;
    phase: number;
    yearDay: number;
    energy: number;
    timeBlock: number;
    understandingScore: number;
    completionRate: number;
    reflection: string;
    totalDurationMs: number;
    blocksCompleted: string[];
}

/**
 * Save completed session to database
 */
export async function saveSession(input: SaveSessionInput) {
    try {
        const { data, error } = await supabaseServer
            .from("sessions")
            .insert({
                user_id: input.userId,
                plan_id: input.planId,
                topic: input.topic,
                phase: input.phase,
                year_day: input.yearDay,
                energy: input.energy,
                time_block: input.timeBlock,
                understanding_score: input.understandingScore,
                completion_rate: input.completionRate,
                reflection: input.reflection,
                total_duration_ms: input.totalDurationMs,
                blocks_completed: input.blocksCompleted,
                completed_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;

        // Update session plan status
        await supabaseServer
            .from("session_plans")
            .update({ status: "completed", completed_at: new Date().toISOString() })
            .eq("id", input.planId);

        return { success: true, sessionId: data.id };
    } catch (error: any) {
        console.error("Error saving session:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Save energy snapshot
 */
export async function saveEnergySnapshot(
    userId: string,
    energy: number,
    sleepHours: number,
    stressLevel: number,
    notes: string
) {
    try {
        const today = new Date().toISOString().split("T")[0];

        const { error } = await supabaseServer
            .from("energy_snapshots")
            .upsert({
                user_id: userId,
                date: today,
                energy,
                sleep_hours: sleepHours,
                stress_level: stressLevel,
                notes,
            });

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error("Error saving energy snapshot:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Save reflection
 */
export async function saveReflection(
    userId: string,
    type: "morning" | "evening",
    content: string,
    energyBefore: number,
    energyAfter?: number
) {
    try {
        const { data: reflection, error } = await supabaseServer
            .from("reflections")
            .insert({
                user_id: userId,
                type,
                content,
                energy_before: energyBefore,
                energy_after: energyAfter,
            })
            .select()
            .single();

        if (error) throw error;

        // Optionally analyze sentiment
        // const sentiment = await analyzeSentiment(content);
        // await supabaseServer.from("reflections").update({ sentiment: sentiment.sentiment }).eq("id", reflection.id);

        return { success: true, reflectionId: reflection.id };
    } catch (error: any) {
        console.error("Error saving reflection:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Update user mode
 */
export async function updateUserMode(userId: string, mode: string) {
    try {
        const { error } = await supabaseServer
            .from("user_settings")
            .update({ preferred_mode: mode })
            .eq("user_id", userId);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error("Error updating user mode:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Export all user data as JSON
 */
export async function exportUserData(userId: string) {
    try {
        const [sessions, reflections, energySnapshots, plans] = await Promise.all([
            supabaseServer.from("sessions").select("*").eq("user_id", userId),
            supabaseServer.from("reflections").select("*").eq("user_id", userId),
            supabaseServer.from("energy_snapshots").select("*").eq("user_id", userId),
            supabaseServer.from("session_plans").select("*").eq("user_id", userId),
        ]);

        const exportData = {
            exportDate: new Date().toISOString(),
            userId,
            sessions: sessions.data || [],
            reflections: reflections.data || [],
            energySnapshots: energySnapshots.data || [],
            plans: plans.data || [],
        };

        return { success: true, data: exportData };
    } catch (error: any) {
        console.error("Error exporting data:", error);
        return { success: false, error: error.message };
    }
}
