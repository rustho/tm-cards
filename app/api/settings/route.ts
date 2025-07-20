import { NextRequest, NextResponse } from "next/server";
import type { UserSettings, NotificationSettings, MatchingScheduleSettings } from "@/models/types";

export const dynamic = 'force-dynamic';

// Mock data storage (in production, this would be database)
const mockUserSettings: { [userId: string]: UserSettings } = {
  "default": {
    userId: "default",
    notifications: {
      newMatches: true,
      messages: true,
      profileViews: false,
      gameInvites: true,
      weeklyDigest: true,
    },
    matchingSchedule: {
      option: "active",
      customDate: null,
      resumeDate: null,
      lastUpdated: new Date().toISOString(),
    }
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';

    const userSettings = mockUserSettings[userId] || mockUserSettings["default"];

    return NextResponse.json(userSettings);
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';
    
    const settingsUpdate = await request.json();

    // Get existing settings or create new
    const existingSettings = mockUserSettings[userId] || mockUserSettings["default"];
    
    // Update settings
    const updatedSettings: UserSettings = {
      ...existingSettings,
      userId,
      ...settingsUpdate,
    };

    // Save settings (mock storage)
    mockUserSettings[userId] = updatedSettings;

    return NextResponse.json({ 
      success: true, 
      message: "Settings updated successfully",
      settings: updatedSettings
    });
  } catch (error) {
    console.error("Error saving user settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 