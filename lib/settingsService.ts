import { NotificationSettings, MatchingScheduleSettings } from "@/models/types";

class SettingsService {
  private baseUrl = '/api/settings';

  // Notification Settings
  async getNotificationSettings(userId?: string): Promise<NotificationSettings> {
    const params = userId ? `?userId=${userId}` : '';
    const response = await fetch(`${this.baseUrl}/notifications${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch notification settings');
    }
    
    return response.json();
  }

  async updateNotificationSettings(
    settings: NotificationSettings, 
    userId?: string
  ): Promise<{ success: boolean; message: string; settings: NotificationSettings }> {
    const params = userId ? `?userId=${userId}` : '';
    const response = await fetch(`${this.baseUrl}/notifications${params}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update notification settings');
    }
    
    return response.json();
  }

  // Matching Schedule Settings
  async getMatchingSchedule(userId?: string): Promise<MatchingScheduleSettings> {
    const params = userId ? `?userId=${userId}` : '';
    const response = await fetch(`${this.baseUrl}/matching-schedule${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch matching schedule');
    }
    
    return response.json();
  }

  async updateMatchingSchedule(
    scheduleData: { option: string; customDate?: string }, 
    userId?: string
  ): Promise<{ success: boolean; message: string; settings: MatchingScheduleSettings }> {
    const params = userId ? `?userId=${userId}` : '';
    const response = await fetch(`${this.baseUrl}/matching-schedule${params}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scheduleData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update matching schedule');
    }
    
    return response.json();
  }
}

export const settingsService = new SettingsService(); 