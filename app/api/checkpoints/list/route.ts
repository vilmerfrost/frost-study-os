import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phaseId = searchParams.get('phaseId');

    if (!phaseId) {
      return NextResponse.json({ error: 'phaseId required' }, { status: 400 });
    }

    const { data } = await supabaseServer
      .from('checkpoints')
      .select('*')
      .eq('phase_id', phaseId)
      .order('week_number', { ascending: true });

    // Calculate readiness for each checkpoint
    if (data) {
      for (const checkpoint of data) {
        // Get related topics' mastery scores
        const { data: modules } = await supabaseServer
          .from('modules')
          .select('id')
          .eq('phase_id', phaseId);

        if (modules && modules.length > 0) {
          const { data: topics } = await supabaseServer
            .from('topics')
            .select('mastery_score')
            .in(
              'module_id',
              modules.map((m) => m.id)
            );

          if (topics && topics.length > 0) {
            const avgMastery = topics.reduce((sum, t) => sum + (t.mastery_score || 0), 0) / topics.length;
            checkpoint.readiness_score = Math.round(avgMastery);
          }
        }
      }
    }

    return NextResponse.json({ checkpoints: data || [] }, { status: 200 });
  } catch (error) {
    console.error('Failed to load checkpoints:', error);
    return NextResponse.json({ error: 'Failed to load checkpoints' }, { status: 500 });
  }
}

