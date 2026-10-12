import { adminRoute, jsonBody } from "@/lib/adminRoute";
import { AdminError, findUserId } from "@/lib/adminService";
import { createMatch, discardDrafts, getRound, publishRound } from "@/lib/adminMatching";
import { track } from "@/lib/events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// Publishing announces every pair through the bot.
export const maxDuration = 60;

type Params = { roundId: string };

/** GET /api/admin/matching/rounds/[roundId] — a round with every pair (drafts too), accepts and feedback. */
export const GET = adminRoute<Params>("round", (_request, { params }) => getRound(params.roundId));

/**
 * POST /api/admin/matching/rounds/[roundId] — `AdminRoundAction`:
 * - createMatch { a, b, publish?, notify? } (Telegram ids): a pair by hand, a draft unless `publish`;
 *   409 when one of them already has a pair in the round;
 * - publish { notify? }: every draft pair goes live (and is announced with `notify`);
 * - discardDrafts: deletes the round's unpublished pairs.
 * Returns the updated round (plus `result` for publish).
 */
export const POST = adminRoute<Params>("round action", async (request, { admin, params }) => {
  const body = await jsonBody(request);
  const adminUserId = await findUserId(admin.id).catch(() => null);

  switch (body.action) {
    case "createMatch": {
      if (typeof body.a !== "string" || typeof body.b !== "string") throw new AdminError("a and b are required", 400);
      const publish = body.publish === true;
      const notify = body.notify === true;
      const matchId = await createMatch(params.roundId, { action: "createMatch", a: body.a, b: body.b, publish, notify });
      track("admin_match_created", adminUserId, { by: admin.id, matchId, a: body.a, b: body.b, publish, notify });
      console.log(`➕ ${admin.id} paired ${body.a} ↔ ${body.b} in round ${params.roundId}${publish ? "" : " (draft)"}`);
      return getRound(params.roundId);
    }
    case "publish": {
      const result = await publishRound(params.roundId, body.notify === true);
      track("admin_round_published", adminUserId, { by: admin.id, roundId: params.roundId, ...result });
      return { ...(await getRound(params.roundId)), result };
    }
    case "discardDrafts": {
      const count = await discardDrafts(params.roundId);
      track("admin_drafts_discarded", adminUserId, { by: admin.id, roundId: params.roundId, count });
      return getRound(params.roundId);
    }
    default:
      throw new AdminError("Unknown action", 400);
  }
});
