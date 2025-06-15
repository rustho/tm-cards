import { NextRequest, NextResponse } from "next/server";
import { NotificationSettings } from "@/models/types";

// Mock data storage (in production, this would be database)
const mockNotificationSettings: { [userId: string]: NotificationSettings } = {
  "default": {
    newMatches: true,
    messages: true,
    profileViews: false,
    gameInvites: true,
    weeklyDigest: true,
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';

    const settings = mockNotificationSettings[userId] || mockNotificationSettings["default"];

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching notification settings:", error);
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
    
    const notificationSettings: NotificationSettings = await request.json();

    // Validate the settings
    const requiredFields = ['newMatches', 'messages', 'profileViews', 'gameInvites', 'weeklyDigest'];
    for (const field of requiredFields) {
      if (typeof notificationSettings[field as keyof NotificationSettings] !== 'boolean') {
        return NextResponse.json(
          { error: `Invalid value for ${field}` },
          { status: 400 }
        );
      }
    }

    // Save settings (mock storage)
    mockNotificationSettings[userId] = notificationSettings;

    return NextResponse.json({ 
      success: true, 
      message: "Notification settings updated successfully",
      settings: notificationSettings
    });
  } catch (error) {
    console.error("Error saving notification settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 