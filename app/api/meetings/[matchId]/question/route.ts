import { NextRequest, NextResponse } from "next/server";
import { authenticate, authErrorResponse, ensureUser } from "@/lib/auth";
import { getWeeklyQuestion, WeekMatchError } from "@/lib/weekMatchService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/meetings/[matchId]/question — the pair's question of the week; 403 until both accepted. */
export async function GET(request: NextRequest, { params }: { params: { matchId: string } }) {
  try {
    const user = await ensureUser(await authenticate(request));
    return NextResponse.json(await getWeeklyQuestion(params.matchId, user.id));
  } catch (error) {
    if (error instanceof WeekMatchError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const authError = authErrorResponse(error);
    if (authError) return authError;
    console.error("Error fetching weekly question:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
