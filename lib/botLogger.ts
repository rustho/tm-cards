import prisma from './prisma';

class BotLogger {
  private static instance: BotLogger;
  private sessionMap: Map<string, string> = new Map();

  static getInstance(): BotLogger {
    if (!BotLogger.instance) {
      BotLogger.instance = new BotLogger();
    }
    return BotLogger.instance;
  }

  // Generate or get session ID for user
  private getSessionId(userId: string): string {
    if (!this.sessionMap.has(userId)) {
      this.sessionMap.set(userId, `session_${userId}_${Date.now()}`);
    }
    return this.sessionMap.get(userId)!;
  }

  // Log incoming user message
  async logUserMessage(userId: string, username: string | undefined, firstName: string | undefined, lastName: string | undefined, chatId: string, message: string) {
    try {
      await prisma.botLog.create({
        data: {
          userId,
          username,
          firstName,
          lastName,
          chatId,
          type: 'message_received',
          message,
          sessionId: this.getSessionId(userId),
          success: true
        }
      });
      console.log(`📥 Logged user message from ${firstName || username || userId}`);
    } catch (error) {
      // In development, just log to console instead of failing
      if (process.env.NODE_ENV === 'development') {
        console.log(`📥 User message from ${firstName || username || userId}: ${message}`);
      } else {
        console.error('Error logging user message:', error);
      }
    }
  }

  // Log bot response
  async logBotResponse(userId: string, chatId: string, message: string, responseTime?: number) {
    try {
      await prisma.botLog.create({
        data: {
          userId,
          chatId,
          type: 'message_sent',
          message,
          sessionId: this.getSessionId(userId),
          responseTime,
          success: true
        }
      });
      console.log(`📤 Logged bot response to ${userId}`);
    } catch (error) {
      // In development, just log to console instead of failing
      if (process.env.NODE_ENV === 'development') {
        console.log(`📤 Bot response to ${userId}: ${message.substring(0, 100)}...`);
      } else {
        console.error('Error logging bot response:', error);
      }
    }
  }

  // Log command usage
  async logCommand(userId: string, username: string | undefined, firstName: string | undefined, chatId: string, command: string, success: boolean = true) {
    try {
      await prisma.botLog.create({
        data: {
          userId,
          username,
          firstName,
          chatId,
          type: 'command_used',
          command,
          sessionId: this.getSessionId(userId),
          success
        }
      });
      console.log(`⚡ Logged command /${command} from ${firstName || username || userId}`);
    } catch (error) {
      // In development, just log to console instead of failing
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚡ Command /${command} from ${firstName || username || userId}`);
      } else {
        console.error('Error logging command:', error);
      }
    }
  }

  // Log notification sent
  async logNotification(
    userId: string, 
    chatId: string, 
    notificationType: 'match_notification' | 'travel_tip' | 'welcome' | 'profile_reminder' | 'custom',
    message: string,
    notificationData?: any,
    success: boolean = true
  ) {
    try {
      await prisma.botLog.create({
        data: {
          userId,
          chatId,
          type: 'notification_sent',
          message,
          notificationType,
          notificationData: notificationData || undefined,
          sessionId: this.getSessionId(userId),
          success
        }
      });
      console.log(`🔔 Logged ${notificationType} notification to ${userId}`);
    } catch (error) {
      // In development, just log to console instead of failing
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔔 ${notificationType} notification to ${userId}`);
      } else {
        console.error('Error logging notification:', error);
      }
    }
  }

  // Log user actions (Mini App opened, buttons clicked)
  async logUserAction(userId: string, chatId: string, action: string, miniAppOpened: boolean = false, buttonClicked?: string) {
    try {
      await prisma.botLog.create({
        data: {
          userId,
          chatId,
          type: 'user_action',
          message: `User performed action: ${action}`,
          miniAppOpened,
          buttonClicked,
          sessionId: this.getSessionId(userId),
          success: true
        }
      });
      console.log(`👆 Logged user action: ${action} from ${userId}`);
    } catch (error) {
      console.error('Error logging user action:', error);
    }
  }

  // Log errors
  async logError(userId: string, chatId: string, error: Error | string, context?: string) {
    try {
      const errorMessage = error instanceof Error ? error.message : error;
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      await prisma.botLog.create({
        data: {
          userId,
          chatId,
          type: 'error',
          message: context || 'Bot error occurred',
          error: errorMessage,
          errorStack,
          sessionId: this.getSessionId(userId),
          success: false
        }
      });

      console.error(`❌ Logged error for ${userId}: ${errorMessage}`);
    } catch (logError) {
      // In development, just log to console instead of failing
      if (process.env.NODE_ENV === 'development') {
        const errorMessage = error instanceof Error ? error.message : error;
        console.error(`❌ Error for ${userId}: ${errorMessage}`);
      } else {
        console.error('Error logging error:', logError);
      }
    }
  }

  // Get user conversation history
  async getUserLogs(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const logs = await prisma.botLog.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit
      });
      
      return logs;
    } catch (error) {
      console.error('Error fetching user logs:', error);
      return [];
    }
  }

  // Get bot analytics
  async getBotAnalytics(days: number = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const [
        totalInteractions,
        uniqueUsers,
        commandUsage,
        notificationsSent,
        miniAppOpens,
        errors
      ] = await Promise.all([
        // Total interactions
        prisma.botLog.count({ where: { timestamp: { gte: startDate } } }),
        
        // Unique users
        prisma.botLog.groupBy({
          by: ['userId'],
          where: { timestamp: { gte: startDate } }
        }).then(res => res.length),
        
        // Command usage
        prisma.botLog.groupBy({
          by: ['command'],
          where: {
            type: 'command_used',
            timestamp: { gte: startDate },
            command: { not: null }
          },
          _count: { command: true },
          orderBy: { _count: { command: 'desc' } }
        }),
        
        // Notifications sent
        prisma.botLog.groupBy({
          by: ['notificationType'],
          where: {
            type: 'notification_sent',
            timestamp: { gte: startDate },
            notificationType: { not: null }
          },
          _count: { notificationType: true },
          orderBy: { _count: { notificationType: 'desc' } }
        }),
        
        // Mini App opens
        prisma.botLog.count({
          where: {
            miniAppOpened: true,
            timestamp: { gte: startDate }
          }
        }),
        
        // Errors
        prisma.botLog.count({
          where: {
            type: 'error',
            timestamp: { gte: startDate }
          }
        })
      ]);

      return {
        period: `${days} days`,
        totalInteractions,
        uniqueUsers,
        commandUsage: commandUsage.map(c => ({ _id: c.command, count: c._count.command })),
        notificationsSent: notificationsSent.map(n => ({ _id: n.notificationType, count: n._count.notificationType })),
        miniAppOpens,
        errors,
        avgInteractionsPerUser: uniqueUsers > 0 ? Math.round(totalInteractions / uniqueUsers) : 0
      };
    } catch (error) {
      console.error('Error getting bot analytics:', error);
      return null;
    }
  }

  // Get recent activity
  async getRecentActivity(limit: number = 20) {
    try {
      const logs = await prisma.botLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: limit
      });
      
      return logs;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  // Clear old logs (cleanup function)
  async cleanupOldLogs(daysToKeep: number = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const result = await prisma.botLog.deleteMany({
        where: { timestamp: { lt: cutoffDate } }
      });
      console.log(`🧹 Cleaned up ${result.count} old bot logs`);
      
      return result.count;
    } catch (error) {
      console.error('Error cleaning up old logs:', error);
      return 0;
    }
  }

  // New session (when user starts fresh conversation)
  newSession(userId: string) {
    this.sessionMap.set(userId, `session_${userId}_${Date.now()}`);
  }
}

export default BotLogger;
