import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MatchingUser from "@/models/MatchingUser";

export async function GET() {
  try {
    await connectDB();
    const users = await MatchingUser.find({ isActive: true });

    const mappedUsers = users.map((user) => ({
      id: user.telegramId,
      username: user.username,
      name: user.name,
      interests: user.interests,
      dateOfBirth: user.dateOfBirth,
      country: user.country,
      region: user.region,
      placesToVisit: Array.isArray(user.placesToVisit) ? user.placesToVisit.join(', ') : user.placesToVisit,
      instagram: user.instagram,
      photo: user.photo,
      announcement: user.announcement,
    }));

    return NextResponse.json(mappedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
