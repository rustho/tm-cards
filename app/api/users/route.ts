import { NextResponse } from "next/server";
import { getCachedSheetData } from "@/lib/googleSheets";

export async function GET() {
  try {
    const users = await getCachedSheetData();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}