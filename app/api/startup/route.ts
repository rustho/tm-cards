import { NextResponse } from 'next/server';
import { initializeServices } from '@/lib/initializeServices';


export const dynamic = 'force-dynamic';

// This endpoint auto-initializes services on first app startup
export async function GET() {
  try {
    // Skip initialization during build time to prevent timeouts
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production') {
      console.log('🚀 Auto-starting TravelMate services...');
      
      // Add timeout to prevent hanging during deployment
      const initPromise = initializeServices();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Initialization timeout')), 30000)
      );
      
      await Promise.race([initPromise, timeoutPromise]);
    } else {
      console.log('⏭️ Skipping service initialization during build/development');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Services startup endpoint ready',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown'
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