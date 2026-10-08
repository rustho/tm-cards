import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, authErrorResponse, ensureUser } from "@/lib/auth";
import { closeUnagreedMatches, getWeekPhase } from "@/lib/weekCycle";
import { getAccess, isParticipating } from "@/lib/meetingsService";
import { getCurrentMatch } from "@/lib/weekMatchService";
import type { MeetingsWeek } from "@/models/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/meetings/current — the «Встречи» tab: access, week phase, participation, city, this round's pair. */
export async function GET(request: NextRequest) {
  try {
    const user = await ensureUser(await authenticate(request));
    await closeUnagreedMatches(user.id);
    const [access, settings, profile] = await Promise.all([
      getAccess(user),
      prisma.userSettings.findUnique({ where: { userId: user.id } }),
      prisma.profile.findUnique({ where: { userId: user.id }, include: { location: true } }),
    ]);

    const phase = getWeekPhase();
    const week: MeetingsWeek = {
      hasAccess: access.hasAccess,
      phase,
      participating: isParticipating(settings),
      location: profile?.location ? { country: profile.location.country, region: profile.location.region } : null,
      match: phase !== "signup" && access.hasAccess ? await getCurrentMatch(user.id) : null,
    };
    return NextResponse.json(week);
  } catch (error) {
    const authError = authErrorResponse(error);
    if (authError) return authError;
    console.error("Error fetching meetings week:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
