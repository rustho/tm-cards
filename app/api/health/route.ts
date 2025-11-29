import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Health check for all services
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Simple DB check
    let dbStatus = 'unknown';
    try {
        await prisma.$queryRaw`SELECT 1`;
        dbStatus = 'connected';
    } catch (e) {
        dbStatus = 'error';
    }

    return NextResponse.json({
      success: dbStatus === 'connected',
      overall: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
      database: dbStatus,
      timestamp: new Date().toISOString()
    }, { status: dbStatus === 'connected' ? 200 : 503 });

  } catch (error) {
    console.error('Error in health check:', error);
    return NextResponse.json({
      success: false,
      overall: 'unhealthy',
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
