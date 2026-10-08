import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, authErrorResponse, ensureUser } from "@/lib/auth";
import { closeUnagreedMatches } from "@/lib/weekCycle";
import { meetingInclude, toMeeting, visibleMatchesWhere } from "@/lib/meetingsService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/meetings — the caller's full meeting log (expired matches hidden), newest first. */
export async function GET(request: NextRequest) {
  try {
    const user = await ensureUser(await authenticate(request));
    await closeUnagreedMatches(user.id);
    const matches = await prisma.match.findMany({
      where: visibleMatchesWhere(user.id),
      include: meetingInclude,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(matches.map((m) => toMeeting(m, user.id)));
  } catch (error) {
    const authError = authErrorResponse(error);
    if (authError) return authError;
    console.error("Error fetching meetings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
