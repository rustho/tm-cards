import { User, IUser } from '@/models/schemas/user.schema';
import { DatabaseService } from './database.service';
import { NotificationSettings, MatchingScheduleSettings } from '@/models/types';

export class UserService extends DatabaseService<IUser> {
  constructor() {
    super(User);
  }

  async findByTelegramId(telegramId: string): Promise<IUser | null> {
    return await this.findOne({ telegramId });
  }

  async createUser(userData: {
    telegramId: string;
    firstName: string;
    lastName?: string;
    username?: string;
    languageCode?: string;
    chatId?: string;
  }): Promise<IUser> {
    // Default settings based on actual implementation
    const defaultSettings = {
      notifications: {
        newMatches: true,
        messages: true,
        profileViews: false,
        gameInvites: true,
        weeklyDigest: true
      },
      matchingSchedule: {
        option: 'active' as const,
        lastUpdated: new Date().toISOString()
      },
      app: {
        language: userData.languageCode || 'en',
        theme: 'light' as const
      }
    };

    const defaultStats = {
      profileViews: 0,
      matchesReceived: 0,
      matchesGiven: 0,
      conversationsStarted: 0
    };

    return await this.create({
      ...userData,
      registrationDate: new Date(),
      lastSeen: new Date(),
      isOnline: true,
      settings: defaultSettings,
      stats: defaultStats
    });
  }

  async updateNotificationSettings(
    telegramId: string, 
    notificationSettings: NotificationSettings
  ): Promise<IUser | null> {
    return await this.updateOne(
      { telegramId },
      { 'settings.notifications': notificationSettings }
    );
  }

  async updateMatchingSchedule(
    telegramId: string,
    matchingSchedule: MatchingScheduleSettings
  ): Promise<IUser | null> {
    return await this.updateOne(
      { telegramId },
      { 'settings.matchingSchedule': matchingSchedule }
    );
  }

  async updateOnlineStatus(telegramId: string, isOnline: boolean): Promise<IUser | null> {
    return await this.updateOne(
      { telegramId },
      { 
        isOnline, 
        lastSeen: new Date()
      }
    );
  }

  async getActiveMatchingUsers(): Promise<IUser[]> {
    return await this.find({
      status: 'active',
      'settings.matchingSchedule.option': 'active'
    });
  }

  async incrementStat(telegramId: string, statField: keyof IUser['stats']): Promise<void> {
    await this.model.updateOne(
      { telegramId },
      { $inc: { [`stats.${statField}`]: 1 } }
    );
  }

  async getUserSettings(telegramId: string): Promise<IUser['settings'] | null> {
    const user = await this.findOne({ telegramId }, []);
    return user?.settings || null;
  }

  async getUserStats(telegramId: string): Promise<IUser['stats'] | null> {
    const user = await this.findOne({ telegramId }, []);
    return user?.stats || null;
  }
}

export const userService = new UserService(); 