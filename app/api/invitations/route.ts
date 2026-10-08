import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, authErrorResponse, ensureUser } from "@/lib/auth";
import { getInviteLink } from "@/lib/bot";
import { getAccess, toPerson } from "@/lib/meetingsService";
import type { InvitationsSummary } from "@/models/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/invitations — whether the caller can invite, their link, and who joined through it. */
export async function GET(request: NextRequest) {
  try {
    const user = await ensureUser(await authenticate(request));
    const [{ subscribed }, invited] = await Promise.all([
      getAccess(user),
      prisma.user.findMany({
        where: { referrerId: user.id },
        select: {
          telegramId: true,
          firstName: true,
          lastName: true,
          profile: { select: { name: true, photo: true, occupation: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const summary: InvitationsSummary = {
      canInvite: subscribed,
      inviteLink: subscribed ? await getInviteLink(user.referralCode) : null,
      invited: invited.map((u) => ({ ...toPerson(u), occupation: u.profile?.occupation ?? "" })),
    };
    return NextResponse.json(summary);
  } catch (error) {
    const authError = authErrorResponse(error);
    if (authError) return authError;
    console.error("Error fetching invitations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
