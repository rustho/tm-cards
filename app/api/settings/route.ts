import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, authErrorResponse, ensureUser } from "@/lib/auth";
import { getAccess, toParticipation } from "@/lib/meetingsService";
import type { AccountSettings } from "@/models/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/settings — the «Профиль» menu: access status, meetings participation, the bot notifications flag. */
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request);
    const user = await ensureUser(auth);
    const [access, settings] = await Promise.all([
      getAccess(user),
      prisma.userSettings.findUnique({ where: { userId: user.id } }),
    ]);

    const body: AccountSettings = {
      access: {
        hasAccess: access.hasAccess,
        subscribed: access.subscribed,
        accessEndsAt: access.accessEndsAt?.toISOString() ?? null,
      },
      participation: toParticipation(settings),
      notifications: settings?.notifyNewMatches ?? true,
    };
    return NextResponse.json(body);
  } catch (error) {
    const authError = authErrorResponse(error);
    if (authError) return authError;
    console.error("❌ Error reading /api/settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
