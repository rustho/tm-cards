import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MatchingUser from "@/models/MatchingUser";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    await connectDB();
    
    const user = await MatchingUser.findOne({ telegramId: userId });
    
    if (!user) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    
    // previousMatches is an array of strings (telegramIds)
    const previousMatchIds = user.previousMatches || [];
    
    if (previousMatchIds.length === 0) {
        return NextResponse.json([]);
    }

    const matches = await MatchingUser.find({
        telegramId: { $in: previousMatchIds }
    });

    const mappedMatches = matches.map((match) => ({
      id: match.telegramId,
      username: match.username,
      name: match.name,
      interests: match.interests,
      dateOfBirth: match.dateOfBirth,
      country: match.country,
      region: match.region,
      placesToVisit: Array.isArray(match.placesToVisit) ? match.placesToVisit.join(', ') : match.placesToVisit,
      instagram: match.instagram,
      photo: match.photo,
      announcement: match.announcement,
      // Add other fields as needed to match frontend interface
    }));

    return NextResponse.json(mappedMatches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
