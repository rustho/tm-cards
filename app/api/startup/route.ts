import { NextResponse } from 'next/server';
import { initializeServices } from '@/lib/initializeServices';

// This endpoint auto-initializes services on first app startup
export async function GET() {
  try {
    console.log('🚀 Auto-starting TravelMate services...');
    await initializeServices();
    
    return NextResponse.json({
      success: true,
      message: 'All services initialized successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to initialize services',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 