import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, authErrorResponse, ensureUser } from "@/lib/auth";
import { setParticipation, toParticipation } from "@/lib/meetingsService";
import type { ParticipationChoice } from "@/models/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DAY_MS = 24 * 60 * 60 * 1000;
const CHOICES: ParticipationChoice[] = ["active", "pause_week", "pause_custom"];

/**
 * PUT /api/settings/participation `{ option, resumeDate? }` — «Участие во встречах».
 * `active` behaves like «Участвую» on /meetings (clears any pause and the weekly skip);
 * `pause_week` resumes in 7 days; `pause_custom` needs a future `resumeDate` (YYYY-MM-DD).
 * Matching treats a pause as over once `matchingResumeDate` has passed.
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticate(request);
    const body = await request.json().catch(() => null);
    const option = body?.option as ParticipationChoice;
    if (!CHOICES.includes(option)) {
      return NextResponse.json({ error: "Invalid participation option" }, { status: 400 });
    }

    let resumeDate: Date | null = null;
    if (option === "pause_week") resumeDate = new Date(Date.now() + 7 * DAY_MS);
    if (option === "pause_custom") {
      const raw = typeof body?.resumeDate === "string" ? body.resumeDate : "";
      resumeDate = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(`${raw}T00:00:00Z`) : null;
      if (!resumeDate || isNaN(resumeDate.getTime()) || resumeDate.getTime() <= Date.now()) {
        return NextResponse.json({ error: "resumeDate must be a future YYYY-MM-DD date" }, { status: 400 });
      }
    }

    const user = await ensureUser(auth);
    const pause = {
      matchingOption: option,
      matchingCustomDate: option === "pause_custom" ? resumeDate : null,
      matchingResumeDate: resumeDate,
    };
    const row =
      option === "active"
        ? await setParticipation(user.id, true)
        : await prisma.userSettings.upsert({ where: { userId: user.id }, update: pause, create: { userId: user.id, ...pause } });
    return NextResponse.json(toParticipation(row));
  } catch (error) {
    const authError = authErrorResponse(error);
    if (authError) return authError;
    console.error("❌ Error saving participation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
