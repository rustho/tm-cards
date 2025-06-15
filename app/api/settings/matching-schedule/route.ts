import { NextRequest, NextResponse } from "next/server";
import { MatchingScheduleSettings } from "@/models/types";

// Mock data storage (in production, this would be database)
const mockMatchingSchedules: { [userId: string]: MatchingScheduleSettings } = {
  "default": {
    option: "active",
    customDate: null,
    resumeDate: null,
    lastUpdated: new Date().toISOString(),
  }
};

function calculateResumeDate(option: string, customDate?: string | null): string | null {
  const now = new Date();
  
  switch (option) {
    case "pause_week":
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);
      return nextWeek.toISOString();
    case "pause_month":
      const nextMonth = new Date(now);
      nextMonth.setMonth(now.getMonth() + 1);
      return nextMonth.toISOString();
    case "pause_custom":
      return customDate ? new Date(customDate).toISOString() : null;
    case "active":
      return null;
    case "pause_indefinite":
      return null;
    default:
      return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';

    const settings = mockMatchingSchedules[userId] || mockMatchingSchedules["default"];

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching matching schedule:", error);
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
    
    const scheduleData = await request.json();
    const { option, customDate } = scheduleData;

    // Validate the option
    const validOptions = ["active", "pause_week", "pause_month", "pause_custom", "pause_indefinite"];
    if (!validOptions.includes(option)) {
      return NextResponse.json(
        { error: "Invalid schedule option" },
        { status: 400 }
      );
    }

    // Validate custom date if provided
    if (option === "pause_custom" && !customDate) {
      return NextResponse.json(
        { error: "Custom date is required for pause_custom option" },
        { status: 400 }
      );
    }

    // Calculate resume date
    const resumeDate = calculateResumeDate(option, customDate);

    const matchingSchedule: MatchingScheduleSettings = {
      option,
      customDate: option === "pause_custom" ? customDate : null,
      resumeDate,
      lastUpdated: new Date().toISOString(),
    };

    // Save settings (mock storage)
    mockMatchingSchedules[userId] = matchingSchedule;

    return NextResponse.json({ 
      success: true, 
      message: "Matching schedule updated successfully",
      settings: matchingSchedule
    });
  } catch (error) {
    console.error("Error saving matching schedule:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 