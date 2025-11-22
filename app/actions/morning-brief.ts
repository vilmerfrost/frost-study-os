'use server';

import { supabaseServer } from '@/lib/supabaseServer';

export interface Resource {
    title: string;
    url: string;
    snippet: string;
    source: string;
}

export interface MorningBrief {
    phase: string;
    week: number;
    topic: string;
    resources: Resource[];
    audioUrl?: string; // For future NotebookLM integration
}

export async function getMorningBrief(userId: string): Promise<MorningBrief> {
    // 1. Get current curriculum status
    const { data: curriculum, error } = await supabaseServer
        .from('curriculum')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'in_progress')
        .single();

    if (error || !curriculum) {
        // Fallback if no active topic
        return {
            phase: "Phase 1: Foundations",
            week: 1,
            topic: "Introduction to Study OS",
            resources: []
        };
    }

    // 2. Search for resources (Mock implementation for now, can swap with Tavily/Perplexity)
    const resources = await searchResources(curriculum.topic);

    return {
        phase: curriculum.phase,
        week: curriculum.week,
        topic: curriculum.topic,
        resources
    };
}

async function searchResources(query: string): Promise<Resource[]> {
    // TODO: Integrate Tavily or Perplexity API here
    // const apiKey = process.env.TAVILY_API_KEY;

    console.log(`Searching for: ${query}`);

    // Mock results
    return [
        {
            title: `${query} - Khan Academy`,
            url: `https://www.khanacademy.org/search?q=${encodeURIComponent(query)}`,
            snippet: `Learn about ${query} with free interactive videos and exercises.`,
            source: "Khan Academy"
        },
        {
            title: `Understanding ${query} (YouTube)`,
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
            snippet: `Top rated videos explaining ${query}.`,
            source: "YouTube"
        },
        {
            title: `${query} - Wikipedia`,
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
            snippet: `Detailed encyclopedia entry for ${query}.`,
            source: "Wikipedia"
        }
    ];
}
