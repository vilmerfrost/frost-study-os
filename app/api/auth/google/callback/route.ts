import { google } from 'googleapis';
import { supabaseServer } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect('/settings?error=no_code');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/google/callback`
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);

    // TODO: Get actual user_id from auth session
    // For now, use placeholder - in production, get from Supabase auth
    const userId = '00000000-0000-0000-0000-000000000000';

    // Store tokens
    await supabaseServer.from('user_calendars').upsert({
      user_id: userId,
      google_access_token: tokens.access_token,
      google_refresh_token: tokens.refresh_token,
      google_token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
      sync_enabled: true,
      last_sync: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

    return NextResponse.redirect('/settings?success=calendar_connected');
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect('/settings?error=auth_failed');
  }
}

