import { supabaseServer } from './supabaseServer';
import { DailyState, EnergyScore, SystemMode } from './types/frost-os';

export async function calculateDailyState(userId: string, currentScore: EnergyScore): Promise<DailyState> {
    // 1. Fetch history (last 3 days)
    const { data: logs, error } = await supabaseServer
        .from('energy_logs')
        .select('score, date')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(3);

    if (error) {
        console.error('Error fetching logs:', error);
        // Default to normal if error, but log it
        return { mode: 'NORMAL', message: 'Error fetching history, defaulting to Normal.', constraints: [] };
    }

    // 2. Fetch Rules Config
    const { data: config } = await supabaseServer
        .from('rules_config')
        .select('*')
        .eq('user_id', userId)
        .single();

    const maxBeastDays = config?.max_beast_days || 3;
    const softWeekInterval = config?.soft_week_interval || 6;

    // Logic Check 1: Beast Mode (3 days of high energy?)
    // Assuming "Beast-nätter" implies high energy output.
    // If we have 3 logs and all are 5 (or maybe >= 4?), and today is also high?
    // The user says: "Har Vilmer haft 3 'Beast-nätter' i rad? If TRUE: SystemMode = 'FORCED_RECOVERY'".
    // So if the PAST 3 days were beasts, today is forced recovery regardless of today's score?
    // Or does today's score count? "När du loggar in och sätter din 'Energy Score' (1-5), kollar koden historiken".
    // So we check history.

    const recentScores = logs?.map(l => l.score) || [];
    const isBeastStreak = recentScores.length >= maxBeastDays && recentScores.every(s => s >= 4); // Assuming 4-5 is Beast

    if (isBeastStreak) {
        return {
            mode: 'FORCED_RECOVERY',
            message: 'Reptilhjärnan: Du har kört för hårt. 3 Beast-dagar i rad.',
            constraints: ['Max 2h fokus', 'Inga nya features', 'Gå och lägg dig tidigt']
        };
    }

    // Logic Check 2: Intervention (Energy 1-2 for 3 days)
    // Including today? The prompt says "Har energin varit 1–2 i tre dagar?".
    // If today is 1-2, and previous 2 were 1-2.
    const lowEnergyStreak = (currentScore <= 2) && (recentScores.slice(0, 2).every(s => s <= 2) && recentScores.length >= 2);

    if (lowEnergyStreak) {
        return {
            mode: 'INTERVENTION',
            message: 'Reptilhjärnan: Varning. Låg energi i 3 dagar.',
            constraints: ['Pinga en vän', 'Blockera tunga uppgifter', 'Endast light work']
        };
    }

    // Logic Check 3: Soft Week
    // We need a way to determine week number.
    const currentWeek = getWeekNumber(new Date());
    const isSoftWeek = currentWeek % softWeekInterval === 0;

    if (isSoftWeek) {
        return {
            mode: 'NORMAL', // Or maybe a specific SOFT_WEEK mode?
            message: 'Reptilhjärnan: Det är Soft Week.',
            constraints: ['BlockNewFeatures = true', 'Underhåll endast', 'Reflektion']
        };
    }

    return {
        mode: 'NORMAL',
        message: 'Reptilhjärnan: Systemet stabilt.',
        constraints: []
    };
}

function getWeekNumber(d: Date): number {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo;
}
