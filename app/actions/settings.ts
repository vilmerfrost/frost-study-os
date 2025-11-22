'use server';

import { supabaseServer } from '@/lib/supabaseServer';
import { RulesConfig } from '@/lib/types/frost-os';
import { revalidatePath } from 'next/cache';

export async function getRulesConfig(): Promise<RulesConfig | null> {
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabaseServer
        .from('rules_config')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching rules config:', error);
        return null;
    }

    return data;
}

export async function updateRulesConfig(
    config: Partial<Omit<RulesConfig, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ success: boolean; error?: string }> {
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const userId = user.id;

    // Check if config exists first
    const existing = await getRulesConfig();

    let error;

    if (existing) {
        const { error: updateError } = await supabaseServer
            .from('rules_config')
            .update({
                ...config,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
        error = updateError;
    } else {
        const { error: insertError } = await supabaseServer
            .from('rules_config')
            .insert({
                user_id: userId,
                ...config
            });
        error = insertError;
    }

    if (error) {
        console.error('Error updating rules config:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/settings');
    return { success: true };
}
