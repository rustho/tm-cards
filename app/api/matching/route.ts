import { NextRequest, NextResponse } from 'next/server';
import MatchingService from '@/lib/matchingService';
import MatchingScheduler from '@/lib/matchingScheduler';

const matchingService = MatchingService.getInstance();
const scheduler = MatchingScheduler.getInstance();

// GET - Get matching status and statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        const stats = await matchingService.getMatchingStats();
        return NextResponse.json({
          success: true,
          data: stats
        });

      case 'scheduler':
        const schedulerStatus = await scheduler.getStatus();
        return NextResponse.json({
          success: true,
          data: schedulerStatus
        });

      case 'config':
        const config = matchingService.getConfig();
        const scheduleConfig = scheduler.getConfig();
        return NextResponse.json({
          success: true,
          data: {
            matching: config,
            scheduler: scheduleConfig,
            commonSchedules: MatchingScheduler.getCommonSchedules()
          }
        });

      default:
        // Return overall status
        const [matchingStats, schedulerStatus2] = await Promise.all([
          matchingService.getMatchingStats(),
          scheduler.getStatus()
        ]);

        return NextResponse.json({
          success: true,
          data: {
            matching: matchingStats,
            scheduler: schedulerStatus2.scheduler
          }
        });
    }

  } catch (error) {
    console.error('Error getting matching info:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get matching information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Run matching or manage scheduler
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json().catch(() => ({}));

    switch (action) {
      case 'run':
        // Manual matching run
        const results = await matchingService.runMatching();
        return NextResponse.json({
          success: true,
          message: 'Matching completed',
          data: results
        });

      case 'start-scheduler':
        // Start the scheduler
        const startResult = await scheduler.start();
        return NextResponse.json(startResult);

      case 'stop-scheduler':
        // Stop the scheduler
        const stopResult = await scheduler.stop();
        return NextResponse.json(stopResult);

      case 'trigger-manual':
        // Manual trigger through scheduler
        const manualResult = await scheduler.triggerManualRun();
        return NextResponse.json(manualResult);

      case 'create-mock-users':
        // Create mock users for testing
        const count = parseInt(body.count || '10');
        const mockResult = await matchingService.createMockUsers(count);
        return NextResponse.json({
          success: mockResult.success,
          message: mockResult.success 
            ? `Created ${count} mock users successfully`
            : 'Failed to create mock users',
          data: mockResult
        });

      case 'cleanup':
        // Clean expired matches
        const cleanupCount = await matchingService.cleanupExpiredMatches();
        return NextResponse.json({
          success: true,
          message: `Cleaned up ${cleanupCount} expired matches`,
          data: { cleanupCount }
        });

      default:
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid action',
            availableActions: [
              'run', 'start-scheduler', 'stop-scheduler', 
              'trigger-manual', 'create-mock-users', 'cleanup'
            ]
          },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in matching operation:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to perform matching operation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update configuration
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const body = await request.json();

    switch (type) {
      case 'matching':
        // Update matching service configuration
        matchingService.updateConfig(body);
        return NextResponse.json({
          success: true,
          message: 'Matching configuration updated',
          data: matchingService.getConfig()
        });

      case 'scheduler':
        // Update scheduler configuration
        const updateResult = await scheduler.updateConfig(body);
        return NextResponse.json(updateResult);

      default:
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid configuration type',
            availableTypes: ['matching', 'scheduler']
          },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error updating configuration:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 