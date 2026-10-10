import { NextResponse } from "next/server";
import MatchingService from "@/lib/matchingService";
import { adminRoute, jsonBody } from "@/lib/adminRoute";
import { AdminError, findUserId } from "@/lib/adminService";
import { listRounds } from "@/lib/adminMatching";
import { track } from "@/lib/events";
import type { AdminMatchingState } from "@/models/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const service = MatchingService.getInstance();

/** GET /api/admin/matching — saved config, run state and the latest rounds. */
export const GET = adminRoute("matching", async (): Promise<AdminMatchingState> => {
  const [config, rounds] = await Promise.all([service.loadConfig(), listRounds()]);
  return { config, isRunning: service.getStatus().isRunning, rounds };
});

/** PUT /api/admin/matching — saves the config (partial) to app_config; returns the full config. */
export const PUT = adminRoute("matching config", async (request, { admin }) => {
  const body = await jsonBody(request);
  let config;
  try {
    config = await service.saveConfig(body, admin.id);
  } catch (error) {
    throw new AdminError(error instanceof Error ? error.message : "Invalid config", 400);
  }
  track("admin_matching_config", await findUserId(admin.id).catch(() => null), { by: admin.id, config });
  return config;
});

/**
 * POST /api/admin/matching?action=preview|run|mock-users
 * - preview: the pairs a run would create now (nothing is written);
 * - run: closes stale pairs and runs matching for the current week (same as the cron);
 * - mock-users: { count } fake complete profiles, development only.
 */
export const POST = adminRoute("matching action", async (request, { admin }) => {
  const action = request.nextUrl.searchParams.get("action");
  switch (action) {
    case "preview":
      return service.previewMatching();
    case "run": {
      await service.cleanupExpiredMatches();
      const result = await service.runMatching();
      track("admin_matching_run", await findUserId(admin.id).catch(() => null), {
        by: admin.id,
        roundWeekStart: result.roundWeekStart,
        matchesCreated: result.matchesCreated,
        errors: result.errors.length,
      });
      return NextResponse.json(result, { status: result.success ? 200 : 500 });
    }
    case "mock-users": {
      if (process.env.NODE_ENV !== "development") throw new AdminError("Mock users are for development only", 403);
      const body = await request.json().catch(() => ({}));
      const count = Math.min(Math.max(parseInt(String(body.count ?? "10"), 10) || 10, 1), 100);
      return service.createMockUsers(count);
    }
    default:
      throw new AdminError("Unknown action", 400);
  }
});
