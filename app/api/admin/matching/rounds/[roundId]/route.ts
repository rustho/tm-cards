import { adminRoute, jsonBody } from "@/lib/adminRoute";
import { AdminError, findUserId } from "@/lib/adminService";
import { createMatch, getRound } from "@/lib/adminMatching";
import { track } from "@/lib/events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { roundId: string };

/** GET /api/admin/matching/rounds/[roundId] — a round with every pair, accepts and feedback. */
export const GET = adminRoute<Params>("round", (_request, { params }) => getRound(params.roundId));

/**
 * POST /api/admin/matching/rounds/[roundId] — { action: "createMatch", a, b, notify? }
 * (Telegram ids): adds a pair by hand. 409 when one of them already has a pair in the round.
 */
export const POST = adminRoute<Params>("round action", async (request, { admin, params }) => {
  const body = await jsonBody(request);
  if (body.action !== "createMatch" || typeof body.a !== "string" || typeof body.b !== "string") {
    throw new AdminError("Expected { action: \"createMatch\", a, b }", 400);
  }
  const matchId = await createMatch(params.roundId, { action: "createMatch", a: body.a, b: body.b, notify: body.notify === true });
  track("admin_match_created", await findUserId(admin.id).catch(() => null), {
    by: admin.id,
    matchId,
    a: body.a,
    b: body.b,
    notify: body.notify === true,
  });
  console.log(`➕ ${admin.id} paired ${body.a} ↔ ${body.b} in round ${params.roundId}`);
  return getRound(params.roundId);
});
