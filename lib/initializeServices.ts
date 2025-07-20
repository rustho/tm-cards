import TelegramBotService from './telegramBot';
import MatchingScheduler from './matchingScheduler';
import BotLogger from './botLogger';

let servicesInitialized = false;

export async function initializeServices() {
  if (servicesInitialized) {
    console.log('📋 Services already initialized');
    return;
  }

  const logger = BotLogger.getInstance();
  
  try {
    console.log('🚀 Initializing TravelMate services...');

    // Initialize Telegram Bot if token is available
    if (process.env.TELEGRAM_BOT_TOKEN) {
      try {
        const botService = new TelegramBotService();
        await botService.initialize();
        console.log('✅ Telegram Bot service initialized');
        
        // Log service startup
        await logger.logUserAction(
          'system',
          'system',
          'bot_service_started',
          false,
          'server_startup'
        );
      } catch (botError) {
        console.error('❌ Failed to initialize Telegram Bot:', botError);
        await logger.logError(
          'system',
          'system',
          botError as Error,
          'bot_initialization'
        );
      }
    } else {
      console.log('⚠️ TELEGRAM_BOT_TOKEN not found, skipping bot initialization');
    }

    // Initialize Matching Scheduler
    try {
      const scheduler = MatchingScheduler.getInstance();
      
      // Check if we should auto-start the scheduler
      const autoStart = process.env.AUTO_START_MATCHING_SCHEDULER !== 'false';
      
      if (autoStart) {
        const result = await scheduler.start();
        if (result.success) {
          console.log('✅ Matching scheduler started automatically');
          
          // Log scheduler startup
          await logger.logUserAction(
            'system',
            'system',
            'matching_scheduler_started',
            false,
            'server_startup'
          );
        } else {
          console.log('⚠️ Matching scheduler failed to start:', result.message);
        }
      } else {
        console.log('📅 Matching scheduler not auto-started (disabled in config)');
      }
    } catch (schedulerError) {
      console.error('❌ Failed to initialize Matching Scheduler:', schedulerError);
      await logger.logError(
        'system',
        'system',
        schedulerError as Error,
        'scheduler_initialization'
      );
    }

    servicesInitialized = true;
    console.log('🎉 All services initialized successfully');

  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    await logger.logError(
      'system',
      'system',
      error as Error,
      'service_initialization'
    );
  }
}

// Graceful shutdown handler
export async function shutdownServices() {
  console.log('🛑 Shutting down services...');
  
  const logger = BotLogger.getInstance();
  
  try {
    // Stop matching scheduler
    const scheduler = MatchingScheduler.getInstance();
    await scheduler.stop();
    console.log('✅ Matching scheduler stopped');
    
    // Log shutdown
    await logger.logUserAction(
      'system',
      'system',
      'services_shutdown',
      false,
      'server_shutdown'
    );

    console.log('✅ Services shut down gracefully');
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
  }
}

// Health check for services
export async function getServicesHealth() {
  const health = {
    timestamp: new Date().toISOString(),
    services: {
      bot: { status: 'unknown', error: null as string | null },
      scheduler: { status: 'unknown', error: null as string | null },
      database: { status: 'unknown', error: null as string | null }
    },
    overall: 'unknown' as 'healthy' | 'partial' | 'unhealthy' | 'unknown'
  };

  try {
    // Check bot service
    if (process.env.TELEGRAM_BOT_TOKEN) {
      try {
        const botService = new TelegramBotService();
        health.services.bot.status = 'healthy';
      } catch (error) {
        health.services.bot.status = 'unhealthy';
        health.services.bot.error = error instanceof Error ? error.message : 'Unknown error';
      }
    } else {
      health.services.bot.status = 'disabled';
    }

    // Check scheduler service
    try {
      const scheduler = MatchingScheduler.getInstance();
      const status = await scheduler.getStatus();
      health.services.scheduler.status = status.scheduler.isRunning ? 'healthy' : 'stopped';
    } catch (error) {
      health.services.scheduler.status = 'unhealthy';
      health.services.scheduler.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Check database connectivity
    try {
      const connectDB = (await import('./mongodb')).default;
      await connectDB();
      health.services.database.status = 'healthy';
    } catch (error) {
      health.services.database.status = 'unhealthy';
      health.services.database.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Determine overall health
    const statuses = Object.values(health.services).map(s => s.status);
    if (statuses.every(status => status === 'healthy' || status === 'disabled')) {
      health.overall = 'healthy';
    } else if (statuses.some(status => status === 'healthy')) {
      health.overall = 'partial';
    } else {
      health.overall = 'unhealthy';
    }

  } catch (error) {
    console.error('Error checking services health:', error);
    health.overall = 'unhealthy';
  }

  return health;
}

// Auto-initialize on import in development
if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
  // Only in server-side, not in browser
  setTimeout(() => {
    initializeServices().catch(console.error);
  }, 2000); // Wait 2 seconds for app to stabilize
}

export { servicesInitialized }; 