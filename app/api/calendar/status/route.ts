import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  try {
    // Get user_id from header or use placeholder for now
    // TODO: Implement proper auth
    const userId = req.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000000';

    const { data: calendar } = await supabaseServer
      .from('user_calendars')
      .select('*')
      .eq('user_id', userId)
      .single();

    return NextResponse.json({ connected: !!calendar && calendar.sync_enabled });
  } catch (error) {
    console.error('Calendar status error:', error);
    return NextResponse.json({ connected: false }, { status: 500 });
  }
}
