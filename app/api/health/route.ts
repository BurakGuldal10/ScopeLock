import { NextResponse } from 'next/server';

/**
 * GET /api/health
 * Simple health check endpoint for uptime monitoring and deployment verification.
 * Returns the current application status and version.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
