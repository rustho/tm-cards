import { NextRequest, NextResponse } from "next/server";
import { authenticate, authErrorResponse, ensureUser } from "@/lib/auth";
import { getAccess } from "@/lib/meetingsService";
import { acceptMatch, WeekMatchError } from "@/lib/weekMatchService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** POST /api/meetings/[matchId]/accept — «Хочу познакомиться». Returns the updated `CurrentMatch`. */
export async function POST(request: NextRequest, { params }: { params: { matchId: string } }) {
  try {
    const user = await ensureUser(await authenticate(request));
    if (!(await getAccess(user)).hasAccess) {
      return NextResponse.json({ error: "Subscription required" }, { status: 402 });
    }
    return NextResponse.json(await acceptMatch(params.matchId, user.id));
  } catch (error) {
    if (error instanceof WeekMatchError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const authError = authErrorResponse(error);
    if (authError) return authError;
    console.error("Error accepting match:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
