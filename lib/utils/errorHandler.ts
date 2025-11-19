import { NextResponse } from 'next/server';

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Standardized error handler for API routes
 */
export function handleApiError(error: unknown, defaultMessage = 'An error occurred'): NextResponse {
  console.error('API Error:', error);

  if (error instanceof Error) {
    // Known error types
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized', details: error.message },
        { status: 401 }
      );
    }

    if (error.message.includes('Not found')) {
      return NextResponse.json(
        { error: 'Not found', details: error.message },
        { status: 404 }
      );
    }

    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || defaultMessage },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: defaultMessage },
    { status: 500 }
  );
}

/**
 * Success response helper
 */
export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

