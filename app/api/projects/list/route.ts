import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  try {
    // TODO: Get actual user_id from auth
    const userId = '00000000-0000-0000-0000-000000000000';

    const { data } = await supabaseServer
      .from('flagship_projects')
      .select(`
        *,
        phase:phases (name, phase_number),
        milestones:project_milestones (*)
      `)
      .eq('user_id', userId)
      .order('tier', { ascending: true })
      .order('status', { ascending: false });

    return NextResponse.json({ projects: data || [] }, { status: 200 });
  } catch (error) {
    console.error('Failed to load projects:', error);
    return NextResponse.json({ error: 'Failed to load projects' }, { status: 500 });
  }
}

