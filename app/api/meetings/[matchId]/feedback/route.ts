import { NextRequest, NextResponse } from "next/server";
import { authenticate, authErrorResponse, ensureUser } from "@/lib/auth";
import { FeedbackError, parseFeedbackInput, submitFeedback, toMeetingDetails } from "@/lib/meetingsService";
import { FEEDBACK_TEXT_MAX } from "@/models/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/meetings/[matchId]/feedback — the caller's verdict on a meeting.
 * Body: { outcome: "met", impressions: string[] (≥1), text? }
 *     | { outcome: "not_met", reason: string, text? }
 *     | { outcome: "later" }.
 * Returns the updated `MeetingDetails`.
 */
export async function POST(request: NextRequest, { params }: { params: { matchId: string } }) {
  try {
    const user = await ensureUser(await authenticate(request));
    const input = parseFeedbackInput(await request.json().catch(() => null), FEEDBACK_TEXT_MAX);
    if (!input) return NextResponse.json({ error: "Invalid feedback" }, { status: 400 });

    const match = await submitFeedback(params.matchId, user.id, input);
    console.log(`📝 Feedback ${input.outcome} on match ${params.matchId}`);
    return NextResponse.json(toMeetingDetails(match, user.id));
  } catch (error) {
    if (error instanceof FeedbackError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const authError = authErrorResponse(error);
    if (authError) return authError;
    console.error("Error saving feedback:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
