import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, authErrorResponse, ensureUser } from "@/lib/auth";
import type { NotificationSettings } from "@/models/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const KEYS: Array<keyof NotificationSettings> = [
  "newMatches",
  "messages",
  "profileViews",
  "gameInvites",
  "weeklyDigest",
];

const DEFAULTS: NotificationSettings = {
  newMatches: true,
  messages: true,
  profileViews: false,
  gameInvites: true,
  weeklyDigest: true,
};

function fromRow(row: {
  notifyNewMatches: boolean;
  notifyMessages: boolean;
  notifyProfileViews: boolean;
  notifyGameInvites: boolean;
  notifyWeeklyDigest: boolean;
}): NotificationSettings {
  return {
    newMatches: row.notifyNewMatches,
    messages: row.notifyMessages,
    profileViews: row.notifyProfileViews,
    gameInvites: row.notifyGameInvites,
    weeklyDigest: row.notifyWeeklyDigest,
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    const row = await prisma.userSettings.findUnique({ where: { telegramId: user.id } });
    return NextResponse.json(row ? fromRow(row) : DEFAULTS);
  } catch (error) {
    const auth = authErrorResponse(error);
    if (auth) return auth;
    console.error("Error fetching notification settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await authenticate(request);
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    for (const key of KEYS) {
      if (typeof body[key] !== "boolean") {
        return NextResponse.json({ error: `Invalid value for ${key}` }, { status: 400 });
      }
    }
    const settings = body as NotificationSettings;
    const data = {
      notifyNewMatches: settings.newMatches,
      notifyMessages: settings.messages,
      notifyProfileViews: settings.profileViews,
      notifyGameInvites: settings.gameInvites,
      notifyWeeklyDigest: settings.weeklyDigest,
    };

    await ensureUser(user);
    const row = await prisma.userSettings.upsert({
      where: { telegramId: user.id },
      update: data,
      create: { telegramId: user.id, ...data },
    });

    return NextResponse.json({
      success: true,
      message: "Notification settings updated",
      settings: fromRow(row),
    });
  } catch (error) {
    const auth = authErrorResponse(error);
    if (auth) return auth;
    console.error("Error saving notification settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
