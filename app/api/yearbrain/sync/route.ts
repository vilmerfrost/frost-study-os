import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { parseYearBrainFile, syncYearBrainToDatabase } from '@/lib/yearBrain/parser';
import { getUserId } from '@/lib/auth/getUser';

export async function POST(req: NextRequest) {
  try {
    // Get user ID
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const userIdFromForm = formData.get('user_id') as string;

    // Use user ID from form if available (for client-side auth), otherwise fallback to server-side auth
    const userId = userIdFromForm || await getUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - User ID missing' }, { status: 401 });
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    const validExtensions = ['.md', '.txt'];
    const fileName = file.name.toLowerCase();
    if (!validExtensions.some(ext => fileName.endsWith(ext))) {
      return NextResponse.json({ error: 'File must be a .md or .txt file' }, { status: 400 });
    }

    const fileContent = await file.text();

    // Parse with AI
    console.log('🧠 Parsing YearBrain file...');
    console.log('📄 File content preview (first 500 chars):', fileContent.substring(0, 500));

    const parsedData = await parseYearBrainFile(fileContent);

    console.log(`📊 Parsed: ${parsedData.phases.length} phases, ${parsedData.projects.length} projects`);

    if (parsedData.phases.length === 0) {
      return NextResponse.json(
        {
          error: 'No phases found in file',
          details: 'Make sure your markdown file has Phase headers like "## Phase 1: Name" or "## Phase 1 Name"',
        },
        { status: 400 }
      );
    }

    // Sync to database
    console.log('💾 Syncing to database...');
    console.log(`   User ID: ${userId}`);
    console.log(`   Phases to sync: ${parsedData.phases.length}`);

    try {
      await syncYearBrainToDatabase(userId, parsedData);
      console.log('✅ Sync completed successfully');
    } catch (syncError: any) {
      console.error('❌ Sync failed:', syncError);
      throw syncError;
    }

    return NextResponse.json({
      success: true,
      message: 'YearBrain synced successfully',
      phases: parsedData.phases.length,
      projects: parsedData.projects.length,
      modules: parsedData.phases.reduce((sum, p) => sum + p.modules.length, 0),
      topics: parsedData.phases.reduce((sum, p) => sum + p.modules.reduce((s, m) => s + m.topics.length, 0), 0),
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync YearBrain',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

