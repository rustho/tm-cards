import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, authErrorResponse } from "@/lib/auth";
import { toProfile, userWithProfileInclude } from "@/lib/profileDto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/matches/[id] — matches of a user (id = Telegram id). Own id or admin.
 * Returns the partner's `Profile` plus match metadata, newest first.
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await authenticate(request);
    if (auth.id !== params.id && !auth.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { telegramId: params.id } });
    if (!user) return NextResponse.json([]);

    const matches = await prisma.match.findMany({
      where: { OR: [{ user1Id: user.id }, { user2Id: user.id }] },
      include: {
        round: true,
        user1: { include: userWithProfileInclude },
        user2: { include: userWithProfileInclude },
        feedback: { where: { authorId: user.id } },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = matches.map((m) => {
      const partner = m.user1Id === user.id ? m.user2 : m.user1;
      return {
        ...toProfile(partner),
        matchId: m.id,
        matchStatus: m.status,
        matchedAt: m.createdAt.toISOString(),
        weekStart: m.round.weekStart.toISOString().slice(0, 10),
        score: m.score,
        myFeedback: m.feedback[0]
          ? { met: m.feedback[0].met, rating: m.feedback[0].rating, text: m.feedback[0].text }
          : null,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    const authError = authErrorResponse(error);
    if (authError) return authError;
    console.error("Error fetching matches:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
