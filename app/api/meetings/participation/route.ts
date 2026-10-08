import { NextRequest, NextResponse } from "next/server";
import { authenticate, authErrorResponse, ensureUser } from "@/lib/auth";
import { getAccess, isParticipating, setParticipation } from "@/lib/meetingsService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * PUT /api/meetings/participation — body { participating: boolean }.
 * Joining needs access (subscription or trial); skipping is always allowed.
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await ensureUser(await authenticate(request));
    const body = await request.json().catch(() => null);
    if (typeof body?.participating !== "boolean") {
      return NextResponse.json({ error: "participating must be a boolean" }, { status: 400 });
    }
    if (body.participating && !(await getAccess(user)).hasAccess) {
      return NextResponse.json({ error: "Subscription required" }, { status: 402 });
    }

    const settings = await setParticipation(user.id, body.participating);
    console.log(`${body.participating ? "▶️" : "⏸️"} User ${user.telegramId} ${body.participating ? "joins" : "skips"} the next round`);
    return NextResponse.json({ participating: isParticipating(settings) });
  } catch (error) {
    const authError = authErrorResponse(error);
    if (authError) return authError;
    console.error("Error updating participation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
