import { NextResponse } from "next/server";
import { getCachedSheetData } from "@/lib/googleSheets";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = parseInt(params.userId);
    console.log(userId);
    const users = await getCachedSheetData();
    
    if (!users || users.length === 0) {
      return NextResponse.json({ error: "No users data available" }, { status: 404 });
    }
    
    const profile = users.find((user) => user.id == userId);
    
    if (!profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    
    const previousMatches = profile?.previousMatch;
    
    // Check if previousMatches exists and is an array before filtering
    const matches = previousMatches && Array.isArray(previousMatches) 
      ? users.filter((user) => previousMatches.includes(user.id))
      : [];

    console.log(matches);

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
