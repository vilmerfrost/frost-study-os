import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all';
    const currentPhase = parseInt(searchParams.get('phase') || '1');
    const currentWeek = parseInt(searchParams.get('week') || '1');

    // TODO: Get actual user_id from auth
    const userId = '00000000-0000-0000-0000-000000000000';

    let query = supabaseServer
      .from('topics')
      .select(`
        *,
        module:modules (
          name,
          week_start,
          week_end,
          phase:phases (
            phase_number,
            name
          )
        )
      `);

    if (filter === 'this-week') {
      // Get topics from modules active this week
      const { data: modules } = await supabaseServer
        .from('modules')
        .select('id')
        .lte('week_start', currentWeek)
        .gte('week_end', currentWeek);

      if (modules && modules.length > 0) {
        query = query.in(
          'module_id',
          modules.map((m) => m.id)
        );
      } else {
        return NextResponse.json({ topics: [] }, { status: 200 });
      }
    } else if (filter === 'phase') {
      // Get topics from phase modules
      const { data: phase } = await supabaseServer
        .from('phases')
        .select('id')
        .eq('user_id', userId)
        .eq('phase_number', currentPhase)
        .single();

      if (phase) {
        const { data: modules } = await supabaseServer
          .from('modules')
          .select('id')
          .eq('phase_id', phase.id);

        if (modules && modules.length > 0) {
          query = query.in(
            'module_id',
            modules.map((m) => m.id)
          );
        }
      }
    }

    const { data } = await query;

    if (data) {
      // Sort: low mastery first, then locked at bottom
      const sorted = data.sort((a, b) => {
        if (a.is_locked && !b.is_locked) return 1;
        if (!a.is_locked && b.is_locked) return -1;
        return (a.mastery_score || 0) - (b.mastery_score || 0);
      });
      return NextResponse.json({ topics: sorted }, { status: 200 });
    }

    return NextResponse.json({ topics: [] }, { status: 200 });
  } catch (error) {
    console.error('Failed to load topics:', error);
    return NextResponse.json({ error: 'Failed to load topics' }, { status: 500 });
  }
}

