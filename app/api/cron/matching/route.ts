import { NextRequest, NextResponse } from "next/server";
import MatchingService from "@/lib/matchingService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * GET /api/cron/matching — scheduled matching run.
 * Configured in vercel.json; Vercel sends `Authorization: Bearer ${CRON_SECRET}`.
 * Any other scheduler can call it with the same header.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = MatchingService.getInstance();
  try {
    const expired = await service.cleanupExpiredMatches();
    const run = await service.runMatching();
    return NextResponse.json({ success: run.success, expired, run }, { status: run.success ? 200 : 500 });
  } catch (error) {
    console.error("❌ Cron matching failed:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
