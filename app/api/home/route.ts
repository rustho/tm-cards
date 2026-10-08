import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, authErrorResponse, ensureUser } from "@/lib/auth";
import { HOME_HISTORY_LIMIT } from "@/config/constants";
import { getAccess, meetingInclude, OPEN_STATUSES, personSelect, toMeeting, toPerson, visibleMatchesWhere } from "@/lib/meetingsService";
import type { HomeSummary } from "@/models/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PREVIEW_PEOPLE = 3;

/** GET /api/home — the «Люди» tab for the caller: access, latest meetings, counters. */
export async function GET(request: NextRequest) {
  try {
    const user = await ensureUser(await authenticate(request));

    const [access, history, awaitingFeedback, metCount, metRecent, invitedCount, invitedRecent] = await Promise.all([
      getAccess(user),
      prisma.match.findMany({
        where: visibleMatchesWhere(user.id),
        include: meetingInclude,
        orderBy: { createdAt: "desc" },
        take: HOME_HISTORY_LIMIT,
      }),
      prisma.match.count({
        where: { ...visibleMatchesWhere(user.id), status: { in: OPEN_STATUSES }, feedback: { none: { authorId: user.id } } },
      }),
      prisma.match.count({ where: { ...visibleMatchesWhere(user.id), status: "met" } }),
      prisma.match.findMany({
        where: { ...visibleMatchesWhere(user.id), status: "met" },
        include: { user1: { select: personSelect }, user2: { select: personSelect } },
        orderBy: { createdAt: "desc" },
        take: PREVIEW_PEOPLE,
      }),
      prisma.user.count({ where: { referrerId: user.id } }),
      prisma.user.findMany({
        where: { referrerId: user.id },
        select: personSelect,
        orderBy: { createdAt: "desc" },
        take: PREVIEW_PEOPLE,
      }),
    ]);

    const summary: HomeSummary = {
      hasAccess: access.hasAccess,
      accessEndsAt: access.accessEndsAt?.toISOString() ?? null,
      history: history.map((m) => toMeeting(m, user.id)),
      meetings: {
        count: metCount,
        people: metRecent.map((m) => toPerson(m.user1Id === user.id ? m.user2 : m.user1)),
      },
      invited: { count: invitedCount, people: invitedRecent.map(toPerson) },
      awaitingFeedback,
    };
    return NextResponse.json(summary);
  } catch (error) {
    const authError = authErrorResponse(error);
    if (authError) return authError;
    console.error("Error building home summary:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
