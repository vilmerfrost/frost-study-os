import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // TODO: Generate AI message using Ollama
    // For now, return a placeholder message
    const message = "Welcome to your study session! Let's make today productive! 🚀";
    
    return NextResponse.json({ message }, { status: 200 });
  } catch (err) {
    console.error('Error getting daily message:', err);
    return NextResponse.json(
      { error: 'Kunde inte generera meddelande' },
      { status: 500 }
    );
  }
}

