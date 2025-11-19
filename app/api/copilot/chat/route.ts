import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Simple streaming chat endpoint - can be enhanced with Ollama later
export async function POST(req: NextRequest) {
  try {
    const { message, sessionContext, conversationHistory = [] } = await req.json();

    const systemPrompt = `You are a learning co-pilot helping a student study ${sessionContext?.topic || 'a topic'}.

Student's current mastery: ${sessionContext?.masteryLevel || 50}/100
Session type: ${sessionContext?.blockType || 'study'}
Energy level: ${sessionContext?.energy || 3}/5

Your role:
- Explain concepts in simple, intuitive terms
- Generate practice problems when asked
- Provide encouragement and study tips
- Keep responses concise (max 150 words)

Respond in Swedish.`;

    // For now, return a simple response (can be replaced with Ollama streaming)
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Simulate streaming response
          const response = `Hej! Jag hjälper dig med ${sessionContext?.topic || 'studierna'}.\n\n${message}\n\nLåt mig förklara detta koncept...`;
          const words = response.split(' ');

          for (const word of words) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`));
            await new Promise((resolve) => setTimeout(resolve, 50));
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Co-pilot error:', error);
    return new Response(JSON.stringify({ error: 'Chat failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

