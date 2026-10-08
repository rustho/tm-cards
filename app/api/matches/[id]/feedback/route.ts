import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, authErrorResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/matches/[id]/feedback — the caller's feedback on a match (id = match id).
 * Body: { met: boolean, rating?: 1..5, text?: string }. One feedback per participant, upserted.
 * Match status becomes "met" as soon as either side says they met, "not_met" when both say they did not.
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await authenticate(request);
    const body = await request.json().catch(() => null);
    if (!body || typeof body.met !== "boolean") {
      return NextResponse.json({ error: "`met` (boolean) is required" }, { status: 400 });
    }
    const rating =
      body.rating === undefined || body.rating === null
        ? null
        : Number.isInteger(body.rating) && body.rating >= 1 && body.rating <= 5
          ? (body.rating as number)
          : undefined;
    if (rating === undefined) {
      return NextResponse.json({ error: "`rating` must be an integer 1..5" }, { status: 400 });
    }
    const text = typeof body.text === "string" ? body.text.trim().slice(0, 1000) || null : null;

    const user = await prisma.user.findUnique({ where: { telegramId: auth.id } });
    const match = user
      ? await prisma.match.findUnique({ where: { id: params.id }, include: { feedback: true } })
      : null;
    if (!user || !match || (match.user1Id !== user.id && match.user2Id !== user.id)) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const feedback = await prisma.matchFeedback.upsert({
      where: { matchId_authorId: { matchId: match.id, authorId: user.id } },
      update: { met: body.met, rating, text },
      create: { matchId: match.id, authorId: user.id, met: body.met, rating, text },
    });

    const others = match.feedback.filter((f) => f.authorId !== user.id);
    let status = match.status;
    if (body.met || others.some((f) => f.met)) status = "met";
    else if (others.length > 0 && others.every((f) => !f.met)) status = "not_met";
    if (status !== match.status) {
      await prisma.match.update({ where: { id: match.id }, data: { status } });
    }

    return NextResponse.json({ success: true, feedback, matchStatus: status });
  } catch (error) {
    const authError = authErrorResponse(error);
    if (authError) return authError;
    console.error("Error saving feedback:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
