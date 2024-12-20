import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Profile from "@/models/Profile";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get("telegramId");

    if (!telegramId) {
      return NextResponse.json(
        { error: "Telegram ID is required" },
        { status: 400 }
      );
    }

    const profile = await Profile.findOne({ telegramId: parseInt(telegramId) });
    return NextResponse.json(profile || {});
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const profile = await Profile.findOneAndUpdate(
      { telegramId: body.telegramId },
      { ...body, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
