import TelegramBotService from './telegramBot';
import BotLogger from './botLogger';

interface NotificationConfig {
  enabled: boolean;
  types: {
    matches: boolean;
    profileReminders: boolean;
    travelTips: boolean;
    custom: boolean;
  };
}

class BotNotificationService {
  private static instance: BotNotificationService;
  private botService: TelegramBotService | null = null;
  private logger: BotLogger;

  static getInstance(): BotNotificationService {
    if (!BotNotificationService.instance) {
      BotNotificationService.instance = new BotNotificationService();
    }
    return BotNotificationService.instance;
  }

  constructor() {
    this.logger = BotLogger.getInstance();
  }

  // Initialize bot service if needed
  private async ensureBotService(): Promise<TelegramBotService> {
    if (!this.botService) {
      this.botService = new TelegramBotService();
      await this.botService.initialize();
    }
    return this.botService;
  }

  // Send match notification
  async notifyNewMatch(userId: string, matchData: {
    id: string;
    name: string;
    country: string;
    interests: string[];
    photo?: string;
  }) {
    try {
      const bot = await this.ensureBotService();
      
      const commonInterests = matchData.interests.slice(0, 3); // Show top 3 interests
      
      await bot.sendMatchNotification(userId, {
        name: matchData.name,
        country: matchData.country,
        commonInterests
      });

      console.log(`✅ Match notification sent to user ${userId}`);
      return { success: true };

    } catch (error) {
      console.error('Failed to send match notification:', error);
      await this.logger.logError(userId, userId, error as Error, 'notifyNewMatch');
      return { success: false, error };
    }
  }

  // Send profile completion reminder
  async sendProfileReminder(userId: string, missingFields: string[]) {
    try {
      const bot = await this.ensureBotService();
      
      const message = `📝 Complete Your TravelMate Profile!

Your profile is missing some key information:
${missingFields.map(field => `• ${field}`).join('\n')}

A complete profile gets 3x more matches! Update it now to connect with fellow travelers.`;

      await bot.sendCustomNotification(userId, message, {
        type: 'profile_reminder',
        missingFields
      });

      await this.logger.logNotification(
        userId,
        userId,
        'profile_reminder',
        message,
        { missingFields }
      );

      console.log(`✅ Profile reminder sent to user ${userId}`);
      return { success: true };

    } catch (error) {
      console.error('Failed to send profile reminder:', error);
      await this.logger.logError(userId, userId, error as Error, 'sendProfileReminder');
      return { success: false, error };
    }
  }

  // Send daily travel tip
  async sendDailyTravelTip(userId: string, userDestinations: string[] = []) {
    try {
      const bot = await this.ensureBotService();
      
      // Pick a destination from user's interests or random
      const destination = userDestinations.length > 0 
        ? userDestinations[Math.floor(Math.random() * userDestinations.length)]
        : ['vietnam', 'bali', 'thailand', 'sri lanka'][Math.floor(Math.random() * 4)];

      await bot.sendTravelTip(userId, destination);

      console.log(`✅ Travel tip sent to user ${userId} for ${destination}`);
      return { success: true };

    } catch (error) {
      console.error('Failed to send travel tip:', error);
      await this.logger.logError(userId, userId, error as Error, 'sendDailyTravelTip');
      return { success: false, error };
    }
  }

  // Send custom notification with template
  async sendCustomNotification(
    userId: string, 
    template: 'welcome' | 'match_timeout' | 'app_update' | 'event_invite',
    data?: any
  ) {
    try {
      const bot = await this.ensureBotService();
      
      const templates = {
        welcome: `🎉 Welcome to TravelMate!

Thanks for joining our community of travelers! Here's how to get started:

1. Complete your profile 📝
2. Browse destinations 🗺️
3. Find travel buddies 👥
4. Start your adventure! ✈️

Ready to explore the world?`,

        match_timeout: `⏰ Don't Miss Your Match!

You have a pending match with ${data?.matchName || 'someone'} that expires in 24 hours.

Connect now before it's too late!`,

        app_update: `🚀 TravelMate Update Available!

New features:
• Improved matching algorithm
• Video profiles
• Group trip planning
• Real-time chat

Update now to get the latest features!`,

        event_invite: `🎪 You're Invited: ${data?.eventName || 'TravelMate Event'}

${data?.eventDescription || 'Join fellow travelers for an exciting event!'}

📅 ${data?.eventDate || 'Coming soon'}
📍 ${data?.eventLocation || 'Location TBA'}

RSVP in the app!`
      };

      const message = templates[template];
      await bot.sendCustomNotification(userId, message, { template, ...data });

      console.log(`✅ Custom notification (${template}) sent to user ${userId}`);
      return { success: true };

    } catch (error) {
      console.error('Failed to send custom notification:', error);
      await this.logger.logError(userId, userId, error as Error, 'sendCustomNotification');
      return { success: false, error };
    }
  }

  // Bulk notification for announcements
  async sendBulkNotification(userIds: string[], message: string, data?: any) {
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as any[]
    };

    const bot = await this.ensureBotService();

    for (const userId of userIds) {
      try {
        await bot.sendCustomNotification(userId, message, data);
        results.successful++;
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        results.failed++;
        results.errors.push({ userId, error });
        await this.logger.logError(userId, userId, error as Error, 'sendBulkNotification');
      }
    }

    console.log(`📢 Bulk notification sent: ${results.successful} successful, ${results.failed} failed`);
    return results;
  }

  // Get notification preferences (you'll need to implement storage)
  async getNotificationPreferences(userId: string): Promise<NotificationConfig> {
    // This would typically fetch from your database
    // For now, return default preferences
    return {
      enabled: true,
      types: {
        matches: true,
        profileReminders: true,
        travelTips: true,
        custom: true
      }
    };
  }

  // Update notification preferences
  async updateNotificationPreferences(userId: string, config: Partial<NotificationConfig>) {
    try {
      // Here you would save to your database
      // For now, just log the change
      await this.logger.logUserAction(
        userId,
        userId,
        'notification_preferences_updated',
        false,
        'preferences_update'
      );

      console.log(`✅ Notification preferences updated for user ${userId}`);
      return { success: true };

    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      return { success: false, error };
    }
  }

  // Schedule notifications (you might want to use a job queue for this)
  async scheduleNotification(
    userId: string,
    message: string,
    scheduledTime: Date,
    type: 'match_notification' | 'travel_tip' | 'profile_reminder' | 'custom' = 'custom'
  ) {
    try {
      // This is a simple implementation using setTimeout
      // In production, use a proper job queue like Bull or Agenda
      const delay = scheduledTime.getTime() - Date.now();
      
      if (delay > 0) {
        setTimeout(async () => {
          const bot = await this.ensureBotService();
          await bot.sendCustomNotification(userId, message, { scheduled: true, type });
        }, delay);

        await this.logger.logUserAction(
          userId,
          userId,
          'notification_scheduled',
          false,
          'schedule_notification'
        );

        console.log(`⏰ Notification scheduled for user ${userId} at ${scheduledTime}`);
        return { success: true, scheduledTime };
      } else {
        throw new Error('Scheduled time must be in the future');
      }

    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return { success: false, error };
    }
  }
}

export default BotNotificationService;

// Usage examples:

/*
// In your match creation logic:
import BotNotificationService from '@/lib/botNotificationService';

const notificationService = BotNotificationService.getInstance();

// When a new match is created
await notificationService.notifyNewMatch('123456789', {
  id: 'match_123',
  name: 'John Doe',
  country: 'Thailand',
  interests: ['Photography', 'Hiking', 'Food']
});

// Send profile completion reminder
await notificationService.sendProfileReminder('123456789', ['Age', 'Photo', 'Interests']);

// Send daily travel tip
await notificationService.sendDailyTravelTip('123456789', ['thailand', 'bali']);

// Send custom notification
await notificationService.sendCustomNotification('123456789', 'welcome');

// Bulk notification for announcements
await notificationService.sendBulkNotification(
  ['123456789', '987654321'],
  '🎉 TravelMate is now available in 10 new countries!'
);
*/ 