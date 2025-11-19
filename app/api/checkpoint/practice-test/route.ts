import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(req: NextRequest) {
  try {
    const { checkpointId } = await req.json();

    // Get checkpoint
    const { data: checkpoint } = await supabaseServer
      .from('checkpoints')
      .select('*, phase:phases(name)')
      .eq('id', checkpointId)
      .single();

    if (!checkpoint) {
      return NextResponse.json({ error: 'Checkpoint not found' }, { status: 404 });
    }

    // For now, return mock problems (can be enhanced with Ollama later)
    const problems = [
      {
        problem: `Practice problem for ${checkpoint.name}`,
        solution: 'Detailed solution approach...',
        concepts: ['concept1', 'concept2'],
      },
      {
        problem: `Another practice problem for ${checkpoint.name}`,
        solution: 'Detailed solution approach...',
        concepts: ['concept3'],
      },
    ];

    return NextResponse.json({ problems });
  } catch (error) {
    console.error('Test generation error:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}

