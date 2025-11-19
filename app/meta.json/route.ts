import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: 'Study OS',
    version: '1.0.0',
    description: 'AI-powered study planning and tracking system',
  });
}

