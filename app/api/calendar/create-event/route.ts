import { google } from 'googleapis';
import { supabaseServer } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { title, description, start, end, colorId } = await req.json();

    // TODO: Get actual user_id from auth session
    const userId = req.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000000';

    // Get tokens
    const { data: calendar } = await supabaseServer
      .from('user_calendars')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!calendar || !calendar.sync_enabled) {
      return NextResponse.json({ error: 'Calendar not connected' }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/google/callback`
    );

    oauth2Client.setCredentials({
      access_token: calendar.google_access_token,
      refresh_token: calendar.google_refresh_token,
    });

    const calendarAPI = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = await calendarAPI.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: title,
        description: description,
        start: { dateTime: start, timeZone: 'Europe/Stockholm' },
        end: { dateTime: end, timeZone: 'Europe/Stockholm' },
        colorId: colorId || '9', // Blue
        reminders: {
          useDefault: false,
          overrides: [{ method: 'popup', minutes: 10 }],
        },
      },
    });

    return NextResponse.json({ success: true, event: event.data });
  } catch (error: any) {
    console.error('Calendar API error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

