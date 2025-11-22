'use server';

import { supabaseServer } from '@/lib/supabaseServer';
import { calculateDailyState } from '@/lib/reptile-brain';
import { EnergyScore, DailyState } from '@/lib/types/frost-os';
import { revalidatePath } from 'next/cache';

export async function logEnergyAndGetState(score: EnergyScore, notes?: string): Promise<DailyState> {
    // 1. Get current user
    const { data: { user }, error: userError } = await supabaseServer.auth.getUser();

    if (userError || !user) {
        throw new Error('Unauthorized');
    }

    // 2. Log to DB
    const { error: logError } = await supabaseServer
        .from('energy_logs')
        .upsert({
            user_id: user.id,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            score,
            notes
        }, { onConflict: 'user_id, date' });

    if (logError) {
        console.error('Error logging energy:', logError);
        throw new Error('Failed to log energy');
    }

    // 3. Calculate State
    const state = await calculateDailyState(user.id, score);

    revalidatePath('/'); // Refresh UI
    return state;
}
