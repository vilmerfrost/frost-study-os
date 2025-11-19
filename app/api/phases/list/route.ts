import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET() {
  try {
    // TODO: Get actual user_id from auth session
    // For now, use placeholder - same as sync route
    const userId = '00000000-0000-0000-0000-000000000001';
    
    console.log('📋 Fetching phases for user:', userId);

    // Fetch phases with modules, topics, and checkpoints
    const { data: phases, error: phasesError } = await supabaseServer
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
      .order('phase_number', { ascending: true });

    if (phasesError) {
      console.error('❌ Error fetching phases:', phasesError);
      return NextResponse.json(
        { error: 'Failed to fetch phases', details: phasesError.message },
        { status: 500 }
      );
    }

    console.log(`✅ Found ${phases?.length || 0} phases`);
    if (phases && phases.length > 0) {
      console.log(`   Phase 1: ${phases[0].name} (${phases[0].modules?.length || 0} modules)`);
    } else {
      console.warn(`⚠️  No phases found for user ${userId}`);
      // Try to check if phases table exists and has any data
      const { data: allPhases, error: allError } = await supabaseServer
        .from('phases')
        .select('id, phase_number, name, user_id')
        .limit(5);
      
      if (allError) {
        console.error('❌ Error checking phases table:', allError);
      } else {
        console.log(`   Total phases in table: ${allPhases?.length || 0}`);
        if (allPhases && allPhases.length > 0) {
          console.log(`   Sample phase:`, allPhases[0]);
        }
      }
    }

    return NextResponse.json({ phases: phases || [] }, { status: 200 });
  } catch (error: any) {
    console.error('Error in phases list route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch phases', details: error.message },
      { status: 500 }
    );
  }
}

