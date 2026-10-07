import { api } from "@/lib/api";
import type { MatchingScheduleSettings, NotificationSettings } from "@/models/types";

/** Client wrapper for /api/settings/*. The user is derived from init data server-side. */
class SettingsService {
  private baseUrl = "/api/settings";

  getNotificationSettings() {
    return api.get<NotificationSettings>(`${this.baseUrl}/notifications`);
  }

  updateNotificationSettings(settings: NotificationSettings) {
    return api.put<{ success: boolean; message: string; settings: NotificationSettings }>(
      `${this.baseUrl}/notifications`,
      settings
    );
  }

  getMatchingSchedule() {
    return api.get<MatchingScheduleSettings>(`${this.baseUrl}/matching-schedule`);
  }

  updateMatchingSchedule(scheduleData: { option: string; customDate?: string }) {
    return api.put<{ success: boolean; message: string; settings: MatchingScheduleSettings }>(
      `${this.baseUrl}/matching-schedule`,
      scheduleData
    );
  }
}

export const settingsService = new SettingsService();
