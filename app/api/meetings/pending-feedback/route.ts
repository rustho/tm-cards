import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, authErrorResponse, ensureUser } from "@/lib/auth";
import { closeUnagreedMatches } from "@/lib/weekCycle";
import { PENDING_FEEDBACK_DAYS } from "@/config/constants";
import { OPEN_STATUSES, personSelect, toPerson, visibleMatchesWhere } from "@/lib/meetingsService";
import type { PendingFeedback } from "@/models/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * GET /api/meetings/pending-feedback — the latest recent meeting I have not reviewed yet
 * (drives «Как прошло знакомство на этой неделе?» above the tab bar), or null.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await ensureUser(await authenticate(request));
    await closeUnagreedMatches(user.id);
    const match = await prisma.match.findFirst({
      where: {
        ...visibleMatchesWhere(user.id),
        status: { in: OPEN_STATUSES },
        createdAt: { gte: new Date(Date.now() - PENDING_FEEDBACK_DAYS * DAY_MS) },
        feedback: { none: { authorId: user.id } },
      },
      include: { user1: { select: personSelect }, user2: { select: personSelect } },
      orderBy: { createdAt: "desc" },
    });

    const pending: PendingFeedback | null = match
      ? { matchId: match.id, partner: toPerson(match.user1Id === user.id ? match.user2 : match.user1) }
      : null;
    return NextResponse.json(pending);
  } catch (error) {
    const authError = authErrorResponse(error);
    if (authError) return authError;
    console.error("Error fetching pending feedback:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
