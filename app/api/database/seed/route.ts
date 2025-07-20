import { NextRequest, NextResponse } from 'next/server';
import { seedDatabase } from '@/scripts/seed-database';

export async function POST(request: NextRequest) {
  try {
    // Only allow seeding in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Database seeding is not allowed in production' },
        { status: 403 }
      );
    }

    console.log('🌱 Starting database seeding via API...');
    
    // Run the seeding
    await seedDatabase();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ Database seeding failed:', error);
    return NextResponse.json(
      { 
        error: 'Database seeding failed', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Database operations not allowed in production' },
      { status: 403 }
    );
  }

  return NextResponse.json({
    message: 'Database seeding endpoint',
    instructions: 'Send a POST request to this endpoint to seed the database',
    environment: process.env.NODE_ENV
  });
} 