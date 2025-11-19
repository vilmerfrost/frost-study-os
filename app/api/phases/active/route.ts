import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  try {
    // TODO: Get actual user_id from auth
    const userId = req.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000000';

    const { data: phase } = await supabaseServer
      .from('phases')
      .select(`
        *,
        modules (
          *,
          topics (*)
        ),
        checkpoints (*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!phase) {
      return NextResponse.json({ phase: null }, { status: 200 });
    }

    return NextResponse.json({ phase }, { status: 200 });
  } catch (error) {
    console.error('Failed to load active phase:', error);
    return NextResponse.json({ error: 'Failed to load phase' }, { status: 500 });
  }
}

