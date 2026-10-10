import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, authErrorResponse, ensureUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** PUT /api/settings/notifications `{ enabled }` — «Уведомления от бота» (notifyUser() skips users who turned it off). */
export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticate(request);
    const body = await request.json().catch(() => null);
    if (typeof body?.enabled !== "boolean") {
      return NextResponse.json({ error: "enabled must be a boolean" }, { status: 400 });
    }

    const user = await ensureUser(auth);
    const data = { notifyNewMatches: body.enabled as boolean };
    await prisma.userSettings.upsert({ where: { userId: user.id }, update: data, create: { userId: user.id, ...data } });
    return NextResponse.json({ enabled: data.notifyNewMatches });
  } catch (error) {
    const authError = authErrorResponse(error);
    if (authError) return authError;
    console.error("❌ Error saving notification settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
