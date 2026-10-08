import { NextRequest, NextResponse } from "next/server";
import MatchingService from "@/lib/matchingService";
import { requireAdmin, authErrorResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const matchingService = MatchingService.getInstance();

function fail(error: unknown, message: string) {
  const auth = authErrorResponse(error);
  if (auth) return auth;
  console.error(message, error);
  return NextResponse.json(
    { success: false, error: message, details: error instanceof Error ? error.message : "Unknown error" },
    { status: 500 }
  );
}

/** GET /api/matching[?action=stats|config] — admin only. */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const action = request.nextUrl.searchParams.get("action");

    switch (action) {
      case "stats":
        return NextResponse.json({ success: true, data: await matchingService.getMatchingStats() });
      case "config":
        return NextResponse.json({ success: true, data: matchingService.getConfig() });
      default:
        return NextResponse.json({ success: true, data: matchingService.getStatus() });
    }
  } catch (error) {
    return fail(error, "Failed to get matching information");
  }
}

/** POST /api/matching?action=run|create-mock-users|cleanup — admin only. */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const action = request.nextUrl.searchParams.get("action");
    const body = await request.json().catch(() => ({}));

    switch (action) {
      case "run": {
        await matchingService.cleanupExpiredMatches();
        const data = await matchingService.runMatching();
        return NextResponse.json({ success: data.success, message: "Matching completed", data });
      }
      case "create-mock-users": {
        const count = Math.min(Math.max(parseInt(body.count ?? "10", 10) || 10, 1), 100);
        const data = await matchingService.createMockUsers(count);
        return NextResponse.json({ success: data.success, data });
      }
      case "cleanup": {
        const cleanupCount = await matchingService.cleanupExpiredMatches();
        return NextResponse.json({ success: true, data: { cleanupCount } });
      }
      default:
        return NextResponse.json(
          { success: false, error: "Invalid action", availableActions: ["run", "create-mock-users", "cleanup"] },
          { status: 400 }
        );
    }
  } catch (error) {
    return fail(error, "Failed to perform matching operation");
  }
}

/** PUT /api/matching — update in-memory matching config (resets on redeploy). Admin only. */
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }
    matchingService.updateConfig(body);
    return NextResponse.json({ success: true, data: matchingService.getConfig() });
  } catch (error) {
    return fail(error, "Failed to update configuration");
  }
}
