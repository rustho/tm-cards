import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MatchingUser from "@/models/MatchingUser";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Basic validation
    if (!data.name || !data.country) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    // Ensure we have a telegramId. If not provided (local dev?), generate one or error.
    // In production, this should come from auth middleware or trusted source.
    // For now, if no ID is present, we can't save.
    const telegramId = data.id || data.telegramId;
    if (!telegramId) {
        return NextResponse.json(
            { error: "User ID is missing" },
            { status: 400 }
        );
    }

    const updateData = {
        telegramId: telegramId.toString(),
        username: data.username,
        name: data.name,
        dateOfBirth: data.dateOfBirth,
        // age: data.age, // Calculate age from DOB if needed
        country: data.country,
        region: data.region,
        interests: data.interests,
        placesToVisit: data.placesToVisit ? data.placesToVisit.split(',').map((s: string) => s.trim()) : [],
        instagram: data.instagram,
        photo: data.photo,
        announcement: data.announcement,
        isActive: true,
        updatedAt: new Date()
    };

    // Upsert user
    const user = await MatchingUser.findOneAndUpdate(
        { telegramId: telegramId.toString() },
        updateData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error saving profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
