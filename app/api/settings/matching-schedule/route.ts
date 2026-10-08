import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, authErrorResponse, ensureUser } from "@/lib/auth";
import type { MatchingScheduleSettings } from "@/models/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const OPTIONS: MatchingScheduleSettings["option"][] = [
  "active",
  "pause_week",
  "pause_month",
  "pause_custom",
  "pause_indefinite",
];

function calculateResumeDate(option: string, customDate?: string | null): Date | null {
  const now = new Date();
  switch (option) {
    case "pause_week": {
      const d = new Date(now);
      d.setDate(now.getDate() + 7);
      return d;
    }
    case "pause_month": {
      const d = new Date(now);
      d.setMonth(now.getMonth() + 1);
      return d;
    }
    case "pause_custom": {
      if (!customDate) return null;
      const d = new Date(customDate);
      return isNaN(d.getTime()) ? null : d;
    }
    default:
      return null;
  }
}

function fromRow(row: {
  matchingOption: string;
  matchingCustomDate: Date | null;
  matchingResumeDate: Date | null;
  updatedAt: Date;
}): MatchingScheduleSettings {
  return {
    option: row.matchingOption as MatchingScheduleSettings["option"],
    customDate: row.matchingCustomDate?.toISOString() ?? null,
    resumeDate: row.matchingResumeDate?.toISOString() ?? null,
    lastUpdated: row.updatedAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    const account = await prisma.user.findUnique({ where: { telegramId: user.id } });
    const row = account ? await prisma.userSettings.findUnique({ where: { userId: account.id } }) : null;
    const settings: MatchingScheduleSettings = row
      ? fromRow(row)
      : { option: "active", customDate: null, resumeDate: null, lastUpdated: new Date().toISOString() };
    return NextResponse.json(settings);
  } catch (error) {
    const auth = authErrorResponse(error);
    if (auth) return auth;
    console.error("Error fetching matching schedule:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await authenticate(request);
    const body = await request.json().catch(() => null);
    const option = body?.option;
    const customDate = typeof body?.customDate === "string" ? body.customDate : undefined;

    if (!OPTIONS.includes(option)) {
      return NextResponse.json({ error: "Invalid schedule option" }, { status: 400 });
    }
    const resumeDate = calculateResumeDate(option, customDate);
    if (option === "pause_custom" && !resumeDate) {
      return NextResponse.json({ error: "A valid customDate is required for pause_custom" }, { status: 400 });
    }

    const data = {
      matchingOption: option,
      matchingCustomDate: option === "pause_custom" ? resumeDate : null,
      matchingResumeDate: resumeDate,
    };

    const account = await ensureUser(user);
    const row = await prisma.userSettings.upsert({
      where: { userId: account.id },
      update: data,
      create: { userId: account.id, ...data },
    });

    return NextResponse.json({
      success: true,
      message: "Matching schedule updated",
      settings: fromRow(row),
    });
  } catch (error) {
    const auth = authErrorResponse(error);
    if (auth) return auth;
    console.error("Error saving matching schedule:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
