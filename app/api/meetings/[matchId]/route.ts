import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, authErrorResponse, ensureUser } from "@/lib/auth";
import { meetingInclude, toMeetingDetails } from "@/lib/meetingsService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/meetings/[matchId] — one meeting with impressions. Participants only. */
export async function GET(request: NextRequest, { params }: { params: { matchId: string } }) {
  try {
    const user = await ensureUser(await authenticate(request));
    const match = await prisma.match.findUnique({ where: { id: params.matchId }, include: meetingInclude });
    if (!match || match.status === "expired" || (match.user1Id !== user.id && match.user2Id !== user.id)) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }
    return NextResponse.json(toMeetingDetails(match, user.id));
  } catch (error) {
    const authError = authErrorResponse(error);
    if (authError) return authError;
    console.error("Error fetching meeting:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
