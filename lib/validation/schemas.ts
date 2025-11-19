import { z } from 'zod';

// Install zod if not present: npm install zod

export const sessionInputSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  phase: z.number().int().min(1).max(6),
  energy: z.number().int().min(1).max(5),
  timeBlock: z.number().int().min(15).max(480),
  deepDiveTopic: z.string().optional(),
  day: z.number().int().min(1).max(365).optional(),
});

export const sessionQualitySchema = z.object({
  sessionId: z.string().uuid(),
  dayType: z.enum(['minimum', 'normal', 'beast', 'recovery']),
  understanding_score: z.number().int().min(1).max(5).optional(),
  difficulty_score: z.number().int().min(1).max(5).optional(),
  mood_after: z.string().optional(),
  completion_rate: z.number().min(0).max(100).optional(),
  retention_importance: z.number().int().min(1).max(5).optional(),
  reflection: z.string().optional(),
  yearDayIndex: z.number().int().min(1).max(365).optional(),
});

export const yearbrainSyncSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 10 * 1024 * 1024, // 10MB max
    'File size must be less than 10MB'
  ).refine(
    (file) => file.type === 'text/markdown' || file.name.endsWith('.md') || file.name.endsWith('.txt'),
    'File must be a markdown or text file'
  ),
});

