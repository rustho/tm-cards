import connectDB from './mongodb';
import mongoose from 'mongoose';

// Bot Log Schema
const BotLogSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  username: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  chatId: { type: String, required: true },
  
  // Log entry details
  type: { 
    type: String, 
    required: true,
    enum: ['message_received', 'message_sent', 'command_used', 'notification_sent', 'error', 'user_action']
  },
  command: { type: String }, // For command logs
  message: { type: String }, // User message or bot response
  
  // Notification specific
  notificationType: { 
    type: String,
    enum: ['match_notification', 'travel_tip', 'welcome', 'profile_reminder', 'custom']
  },
  notificationData: { type: mongoose.Schema.Types.Mixed }, // Additional notification data
  
  // Interaction tracking
  miniAppOpened: { type: Boolean, default: false },
  buttonClicked: { type: String }, // Which button was clicked
  
  // Error tracking
  error: { type: String },
  errorStack: { type: String },
  
  // Metadata
  timestamp: { type: Date, default: Date.now, index: true },
  sessionId: { type: String }, // Track conversation sessions
  
  // Analytics
  responseTime: { type: Number }, // How long bot took to respond
  success: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Indexes for efficient querying
BotLogSchema.index({ userId: 1, timestamp: -1 });
BotLogSchema.index({ type: 1, timestamp: -1 });
BotLogSchema.index({ notificationType: 1, timestamp: -1 });

const BotLog = mongoose.models.BotLog || mongoose.model('BotLog', BotLogSchema);

interface LogEntry {
  userId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  chatId: string;
  type: 'message_received' | 'message_sent' | 'command_used' | 'notification_sent' | 'error' | 'user_action';
  command?: string;
  message?: string;
  notificationType?: 'match_notification' | 'travel_tip' | 'welcome' | 'profile_reminder' | 'custom';
  notificationData?: any;
  miniAppOpened?: boolean;
  buttonClicked?: string;
  error?: string;
  errorStack?: string;
  sessionId?: string;
  responseTime?: number;
  success?: boolean;
}

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
      await connectDB();
      
      const logEntry = new BotLog({
        userId,
        username,
        firstName,
        lastName,
        chatId,
        type: 'message_received',
        message,
        sessionId: this.getSessionId(userId),
        success: true
      });

      await logEntry.save();
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
      await connectDB();
      
      const logEntry = new BotLog({
        userId,
        chatId,
        type: 'message_sent',
        message,
        sessionId: this.getSessionId(userId),
        responseTime,
        success: true
      });

      await logEntry.save();
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
      await connectDB();
      
      const logEntry = new BotLog({
        userId,
        username,
        firstName,
        chatId,
        type: 'command_used',
        command,
        sessionId: this.getSessionId(userId),
        success
      });

      await logEntry.save();
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
      await connectDB();
      
      const logEntry = new BotLog({
        userId,
        chatId,
        type: 'notification_sent',
        message,
        notificationType,
        notificationData,
        sessionId: this.getSessionId(userId),
        success
      });

      await logEntry.save();
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
      await connectDB();
      
      const logEntry = new BotLog({
        userId,
        chatId,
        type: 'user_action',
        message: `User performed action: ${action}`,
        miniAppOpened,
        buttonClicked,
        sessionId: this.getSessionId(userId),
        success: true
      });

      await logEntry.save();
      console.log(`👆 Logged user action: ${action} from ${userId}`);
    } catch (error) {
      console.error('Error logging user action:', error);
    }
  }

  // Log errors
  async logError(userId: string, chatId: string, error: Error | string, context?: string) {
    try {
      await connectDB();
      
      const errorMessage = error instanceof Error ? error.message : error;
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      const logEntry = new BotLog({
        userId,
        chatId,
        type: 'error',
        message: context || 'Bot error occurred',
        error: errorMessage,
        errorStack,
        sessionId: this.getSessionId(userId),
        success: false
      });

      await logEntry.save();
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
      await connectDB();
      
      const logs = await BotLog.find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();
      
      return logs;
    } catch (error) {
      console.error('Error fetching user logs:', error);
      return [];
    }
  }

  // Get bot analytics
  async getBotAnalytics(days: number = 7) {
    try {
      await connectDB();
      
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
        BotLog.countDocuments({ timestamp: { $gte: startDate } }),
        
        // Unique users
        BotLog.distinct('userId', { timestamp: { $gte: startDate } }),
        
        // Command usage
        BotLog.aggregate([
          { $match: { type: 'command_used', timestamp: { $gte: startDate } } },
          { $group: { _id: '$command', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        
        // Notifications sent
        BotLog.aggregate([
          { $match: { type: 'notification_sent', timestamp: { $gte: startDate } } },
          { $group: { _id: '$notificationType', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        
        // Mini App opens
        BotLog.countDocuments({ 
          miniAppOpened: true, 
          timestamp: { $gte: startDate } 
        }),
        
        // Errors
        BotLog.countDocuments({ 
          type: 'error', 
          timestamp: { $gte: startDate } 
        })
      ]);

      return {
        period: `${days} days`,
        totalInteractions,
        uniqueUsers: uniqueUsers.length,
        commandUsage,
        notificationsSent,
        miniAppOpens,
        errors,
        avgInteractionsPerUser: uniqueUsers.length > 0 ? Math.round(totalInteractions / uniqueUsers.length) : 0
      };
    } catch (error) {
      console.error('Error getting bot analytics:', error);
      return null;
    }
  }

  // Get recent activity
  async getRecentActivity(limit: number = 20) {
    try {
      await connectDB();
      
      const logs = await BotLog.find({})
        .populate('userId', 'firstName username')
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();
      
      return logs;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  // Clear old logs (cleanup function)
  async cleanupOldLogs(daysToKeep: number = 30) {
    try {
      await connectDB();
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const result = await BotLog.deleteMany({ timestamp: { $lt: cutoffDate } });
      console.log(`🧹 Cleaned up ${result.deletedCount} old bot logs`);
      
      return result.deletedCount;
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