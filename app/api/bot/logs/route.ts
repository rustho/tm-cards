import { NextRequest, NextResponse } from 'next/server';
import BotLogger from '@/lib/botLogger';

const logger = BotLogger.getInstance();

// Get bot logs with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    
    // Check if this is an analytics request
    if (searchParams.get('analytics') === 'true') {
      const days = parseInt(searchParams.get('days') || '7');
      const analytics = await logger.getBotAnalytics(days);
      
      return NextResponse.json({
        success: true,
        data: analytics
      });
    }

    // Check if this is a recent activity request
    if (searchParams.get('recent') === 'true') {
      const activityLimit = parseInt(searchParams.get('limit') || '20');
      const recentActivity = await logger.getRecentActivity(activityLimit);
      
      return NextResponse.json({
        success: true,
        data: recentActivity,
        total: recentActivity.length
      });
    }

    // Get user-specific logs
    if (userId) {
      const userLogs = await logger.getUserLogs(userId, limit);
      
      return NextResponse.json({
        success: true,
        data: userLogs,
        total: userLogs.length,
        userId
      });
    }

    // For general logs, we'll need to implement pagination and filtering
    // This is a basic implementation - you might want to enhance it
    const recentLogs = await logger.getRecentActivity(limit);
    
    return NextResponse.json({
      success: true,
      data: recentLogs,
      total: recentLogs.length,
      page,
      limit
    });

  } catch (error) {
    console.error('Error fetching bot logs:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch logs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Cleanup old logs
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    const deletedCount = await logger.cleanupOldLogs(days);
    
    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} old log entries`,
      deletedCount
    });

  } catch (error) {
    console.error('Error cleaning up logs:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to cleanup logs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 