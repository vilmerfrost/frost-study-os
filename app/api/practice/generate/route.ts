import { NextRequest, NextResponse } from 'next/server';

const difficultyPrompts: Record<string, string> = {
  easy: 'beginner-level, focusing on basic understanding',
  medium: 'intermediate-level, applying concepts',
  hard: 'advanced-level, requiring deep understanding',
};

export async function POST(req: NextRequest) {
  try {
    const { topic, difficulty = 'medium', count = 3 } = await req.json();

    // TODO: Get actual user_id from auth session
    // For now, we don't need user auth for generating problems

    const prompt = `Generate ${count} practice problems about "${topic}" at ${difficultyPrompts[difficulty] || difficultyPrompts.medium} difficulty.

For each problem, provide:
1. The problem statement (clear and specific)
2. The solution with step-by-step explanation

Format as JSON array:
[
  {
    "problem": "problem text here",
    "solution": "detailed solution here"
  }
]

Make problems practical and relevant for learning. Respond ONLY with valid JSON.`;

    // For now, return mock problems (can be replaced with Ollama)
    const problems = [
      {
        problem: `Explain the concept of ${topic} in your own words.`,
        solution: `This is a basic explanation of ${topic}. The key points are...`,
      },
      {
        problem: `Apply ${topic} to solve a practical example.`,
        solution: `To apply ${topic}, we first need to...`,
      },
      {
        problem: `What are the common mistakes when working with ${topic}?`,
        solution: `Common mistakes include...`,
      },
    ].slice(0, count);

    return NextResponse.json({ problems });
  } catch (error) {
    console.error('Problem generation error:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}

