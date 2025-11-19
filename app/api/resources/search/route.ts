import { NextRequest, NextResponse } from 'next/server';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

async function searchYouTube(query: string) {
  if (!YOUTUBE_API_KEY) {
    console.warn('YOUTUBE_API_KEY not configured');
    return [];
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=5&key=${YOUTUBE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    return data.items?.map((item: any) => ({
      type: 'youtube',
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channel: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      relevanceScore: calculateRelevance(item, query),
    })) || [];
  } catch (error) {
    console.error('YouTube search error:', error);
    return [];
  }
}

function calculateRelevance(item: any, query: string): number {
  let score = 50;
  const title = item.snippet.title.toLowerCase();
  const queryLower = query.toLowerCase();

  // Title contains exact query
  if (title.includes(queryLower)) score += 30;

  // Educational channels boost
  const eduChannels = ['3blue1brown', 'khan academy', 'mit opencourseware', 'stanford'];
  if (eduChannels.some((ch) => item.snippet.channelTitle.toLowerCase().includes(ch))) {
    score += 20;
  }

  return score;
}

export async function POST(req: NextRequest) {
  try {
    const { topic, masteryLevel = 50 } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic required' }, { status: 400 });
    }

    // Generate search queries based on mastery level
    const queries: string[] = [];
    if (masteryLevel < 40) {
      queries.push(`beginner ${topic} tutorial`, `introduction to ${topic}`, `${topic} basics explained`);
    } else if (masteryLevel >= 40 && masteryLevel < 70) {
      queries.push(`${topic} intermediate`, `${topic} practice problems`, `${topic} examples`);
    } else {
      queries.push(`advanced ${topic}`, `${topic} deep dive`, `${topic} expert level`);
    }

    // Search YouTube for each query
    const allResults = await Promise.all(queries.map((query) => searchYouTube(query)));

    // Flatten and rank results
    const resources = allResults
      .flat()
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5);

    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Resource search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

