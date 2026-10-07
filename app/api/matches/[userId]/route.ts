import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, authErrorResponse } from "@/lib/auth";
import { toProfile } from "@/lib/profileDto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/matches/[userId] — profiles the user has been matched with. Own id or admin. */
export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const user = await authenticate(request);
    if (user.id !== params.userId && !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const row = await prisma.matchingUser.findUnique({ where: { telegramId: params.userId } });
    if (!row) {
      return NextResponse.json([]);
    }
    if (row.previousMatches.length === 0) {
      return NextResponse.json([]);
    }

    const matches = await prisma.matchingUser.findMany({
      where: { telegramId: { in: row.previousMatches } },
    });
    // Most recent match first (previousMatches is appended chronologically)
    const order = new Map(row.previousMatches.map((id, i) => [id, i]));
    matches.sort((a, b) => (order.get(b.telegramId) ?? 0) - (order.get(a.telegramId) ?? 0));

    return NextResponse.json(matches.map(toProfile));
  } catch (error) {
    const auth = authErrorResponse(error);
    if (auth) return auth;
    console.error("Error fetching matches:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
