import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    const user = await prisma.matchingUser.findUnique({
      where: { telegramId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Map to frontend Profile format if necessary
    // Currently frontend expects: id, name, interests, etc.
    const profile = {
        id: user.telegramId,
        username: user.username,
        name: user.name,
        interests: user.interests,
        dateOfBirth: user.dateOfBirth,
        country: user.country,
        region: user.region,
        placesToVisit: Array.isArray(user.placesToVisit) ? user.placesToVisit.join(', ') : user.placesToVisit, // Frontend expects string
        instagram: user.instagram,
        photo: user.photo,
        announcement: user.announcement,
        // Add other fields as needed
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
