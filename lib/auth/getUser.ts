import { supabaseServer } from '@/lib/supabaseServer';
import { headers } from 'next/headers';

/**
 * Get the current authenticated user ID from request headers
 * For API routes, extract user from Authorization header or session cookie
 */
export async function getUserId(): Promise<string | null> {
  try {
    // For now, return placeholder - implement proper auth when Supabase auth is set up
    // TODO: Implement proper session-based auth
    return '00000000-0000-0000-0000-000000000001';
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}

/**
 * Require authentication - throws if user is not authenticated
 */
export async function requireAuth(): Promise<string> {
  const userId = await getUserId();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}

