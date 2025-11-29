import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.matchingUser.findMany({
      where: { isActive: true }
    });

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
