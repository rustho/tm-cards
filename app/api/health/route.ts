import { NextRequest, NextResponse } from 'next/server';
import { getServicesHealth, initializeServices } from '@/lib/initializeServices';

// GET - Health check for all services
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'init') {
      // Manual initialization trigger
      await initializeServices();
      return NextResponse.json({
        success: true,
        message: 'Services initialization triggered'
      });
    }

    // Get comprehensive health status
    const health = await getServicesHealth();
    
    const statusCode = health.overall === 'healthy' ? 200 : 
                      health.overall === 'partial' ? 206 : 503;

    return NextResponse.json({
      success: health.overall !== 'unhealthy',
      ...health
    }, { status: statusCode });

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