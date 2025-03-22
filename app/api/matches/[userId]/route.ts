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
    const profile = users.find((user) => user.id == userId);
    const previousMatches = profile?.previousMatch;
    const matches = users.filter((user) => previousMatches.includes(user.id));

    console.log(matches);

    if (!matches) {
      return NextResponse.json({ error: "No matches found" }, { status: 404 });
    }

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
