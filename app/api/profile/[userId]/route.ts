import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, authErrorResponse } from "@/lib/auth";
import { toProfile } from "@/lib/profileDto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/profile/[userId] — public profile of another user (authenticated users only). */
export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await authenticate(request);
    const row = await prisma.matchingUser.findUnique({ where: { telegramId: params.userId } });
    if (!row || !row.isActive) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    return NextResponse.json(toProfile(row));
  } catch (error) {
    const auth = authErrorResponse(error);
    if (auth) return auth;
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
