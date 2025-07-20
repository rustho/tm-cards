import cron, { ScheduledTask } from 'node-cron';
import MatchingService from './matchingService';
import BotLogger from './botLogger';

interface SchedulerConfig {
  enabled: boolean;
  cronExpression: string; // Default: every 4 hours
  timezone: string;
  runOnStartup: boolean;
}

class MatchingScheduler {
  private static instance: MatchingScheduler;
  private matchingService: MatchingService;
  private logger: BotLogger;
  private config: SchedulerConfig;
  private cronTask: ScheduledTask | null = null;
  private isSchedulerRunning: boolean = false;

  static getInstance(): MatchingScheduler {
    if (!MatchingScheduler.instance) {
      MatchingScheduler.instance = new MatchingScheduler();
    }
    return MatchingScheduler.instance;
  }

  constructor() {
    this.matchingService = MatchingService.getInstance();
    this.logger = BotLogger.getInstance();
    this.config = {
      enabled: true,
      cronExpression: '0 */4 * * *', // Every 4 hours
      timezone: 'UTC',
      runOnStartup: false
    };
  }

  // Start the scheduler
  async start() {
    if (this.isSchedulerRunning) {
      console.log('⏳ Matching scheduler is already running');
      return { success: false, message: 'Scheduler already running' };
    }

    try {
      if (!cron.validate(this.config.cronExpression)) {
        throw new Error(`Invalid cron expression: ${this.config.cronExpression}`);
      }

      this.cronTask = cron.schedule(
        this.config.cronExpression,
        async () => {
          console.log(`🕐 Scheduled matching started at ${new Date().toISOString()}`);
          await this.runScheduledMatching();
        },
        {
          timezone: this.config.timezone
        }
      );

      this.isSchedulerRunning = true;
      console.log(`✅ Matching scheduler started with cron: ${this.config.cronExpression}`);

      // Run immediately on startup if configured
      if (this.config.runOnStartup) {
        console.log('🚀 Running initial matching on startup...');
        setTimeout(async () => {
          await this.runScheduledMatching();
        }, 5000); // Wait 5 seconds for app to initialize
      }

      return {
        success: true,
        message: 'Scheduler started successfully',
        config: this.config,
        nextRun: this.getNextRunTime()
      };

    } catch (error) {
      console.error('Error starting matching scheduler:', error);
      return {
        success: false,
        message: 'Failed to start scheduler',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Stop the scheduler
  async stop() {
    if (!this.isSchedulerRunning || !this.cronTask) {
      console.log('ℹ️ Matching scheduler is not running');
      return { success: false, message: 'Scheduler not running' };
    }

    try {
      this.cronTask.stop();
      this.cronTask.destroy();
      this.cronTask = null;
      this.isSchedulerRunning = false;

      console.log('🛑 Matching scheduler stopped');
      return {
        success: true,
        message: 'Scheduler stopped successfully'
      };

    } catch (error) {
      console.error('Error stopping matching scheduler:', error);
      return {
        success: false,
        message: 'Failed to stop scheduler',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Restart the scheduler with new configuration
  async restart() {
    await this.stop();
    return await this.start();
  }

  // Run scheduled matching with logging
  private async runScheduledMatching() {
    const startTime = Date.now();
    
    try {
      console.log('🎯 Starting scheduled matching process...');
      
      // Clean expired matches first
      const expiredCount = await this.matchingService.cleanupExpiredMatches();
      if (expiredCount > 0) {
        console.log(`🧹 Cleaned up ${expiredCount} expired matches`);
      }

      // Run the matching algorithm
      const results = await this.matchingService.runMatching();
      
      const duration = Date.now() - startTime;
      const logMessage = `Scheduled matching completed: ${results.matchesCreated} matches, ${results.notificationsSent} notifications, ${duration}ms`;

      // Log the matching run (using system user ID for scheduled runs)
      await this.logger.logUserAction(
        'system',
        'system',
        'scheduled_matching_completed',
        false,
        'cron_scheduler'
      );

      // Log detailed results
      console.log(`✅ ${logMessage}`);
      
      if (results.errors.length > 0) {
        console.warn(`⚠️ Matching completed with ${results.errors.length} errors:`, results.errors);
      }

      return results;

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ Scheduled matching failed:', error);
      
      // Log the error
      await this.logger.logError(
        'system',
        'system',
        error as Error,
        'runScheduledMatching'
      );

      throw error;
    }
  }

  // Update scheduler configuration
  async updateConfig(newConfig: Partial<SchedulerConfig>) {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };

    console.log('⚙️ Scheduler configuration updated:', this.config);

    // Restart scheduler if cron expression or enabled status changed
    if (
      this.isSchedulerRunning && 
      (oldConfig.cronExpression !== this.config.cronExpression || 
       oldConfig.enabled !== this.config.enabled ||
       oldConfig.timezone !== this.config.timezone)
    ) {
      console.log('🔄 Restarting scheduler with new configuration...');
      return await this.restart();
    }

    return {
      success: true,
      message: 'Configuration updated',
      config: this.config
    };
  }

  // Get next scheduled run time
  getNextRunTime(): Date | null {
    if (!this.cronTask) return null;

    try {
      // This is a simplified calculation - in production you might want a more accurate method
      const now = new Date();
      const next = new Date(now);
      
      // Simple approximation for "every 4 hours" pattern
      if (this.config.cronExpression === '0 */4 * * *') {
        const currentHour = now.getHours();
        const nextHour = Math.ceil((currentHour + 1) / 4) * 4;
        next.setHours(nextHour, 0, 0, 0);
        
        if (nextHour >= 24) {
          next.setDate(next.getDate() + 1);
          next.setHours(0, 0, 0, 0);
        }
      }
      
      return next;
    } catch (error) {
      console.error('Error calculating next run time:', error);
      return null;
    }
  }

  // Get scheduler status and statistics
  async getStatus() {
    const matchingStats = await this.matchingService.getMatchingStats();
    
    return {
      scheduler: {
        isRunning: this.isSchedulerRunning,
        config: this.config,
        nextRun: this.getNextRunTime()
      },
      matching: matchingStats
    };
  }

  // Manual trigger for testing
  async triggerManualRun() {
    if (!this.isSchedulerRunning) {
      return {
        success: false,
        message: 'Scheduler is not running'
      };
    }

    try {
      console.log('🔧 Manual matching triggered');
      const results = await this.runScheduledMatching();
      
      return {
        success: true,
        message: 'Manual matching completed',
        results
      };
    } catch (error) {
      console.error('Error in manual matching run:', error);
      return {
        success: false,
        message: 'Manual matching failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get predefined cron expressions for common schedules
  static getCommonSchedules() {
    return {
      'every-hour': '0 * * * *',
      'every-2-hours': '0 */2 * * *',
      'every-4-hours': '0 */4 * * *',
      'every-6-hours': '0 */6 * * *',
      'every-12-hours': '0 */12 * * *',
      'daily-morning': '0 9 * * *',
      'daily-evening': '0 18 * * *',
      'twice-daily': '0 9,18 * * *',
      'weekdays-only': '0 9 * * 1-5',
      'weekends-only': '0 10 * * 0,6'
    };
  }

  // Validate cron expression
  static validateCronExpression(expression: string): boolean {
    return cron.validate(expression);
  }

  // Get current configuration
  getConfig() {
    return { ...this.config };
  }
}

export default MatchingScheduler; 