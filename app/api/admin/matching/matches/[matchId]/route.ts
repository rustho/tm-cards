import { adminRoute, jsonBody } from "@/lib/adminRoute";
import { AdminError, findUserId } from "@/lib/adminService";
import { cancelMatch, deleteMatch, getRound, updateMatch } from "@/lib/adminMatching";
import { track } from "@/lib/events";
import type { AdminMatchAction } from "@/models/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/admin/matching/matches/[matchId] — body `AdminMatchAction`:
 * - cancel: pending/postponed pair → expired (hidden from users, kept in history);
 * - delete: removes the pair and its feedback for good, in any round;
 * - update: status, per-side «Хочу познакомиться», or a new person on one side
 *   (`replace`, resets accepts and feedback; `notify` messages both).
 * Returns the updated round.
 */
export const POST = adminRoute<{ matchId: string }>("match action", async (request, { admin, params }) => {
  const body = (await jsonBody(request)) as AdminMatchAction;
  const adminUserId = await findUserId(admin.id).catch(() => null);
  const by = { by: admin.id, matchId: params.matchId };

  switch (body.action) {
    case "cancel": {
      const roundId = await cancelMatch(params.matchId);
      track("admin_match_cancelled", adminUserId, by);
      console.log(`✂️ ${admin.id} cancelled match ${params.matchId}`);
      return getRound(roundId);
    }
    case "delete": {
      const { roundId, snapshot } = await deleteMatch(params.matchId);
      track("admin_match_deleted", adminUserId, {
        ...by,
        a: snapshot.a.telegramId,
        b: snapshot.b.telegramId,
        status: snapshot.status,
        weekStart: snapshot.weekStart,
      });
      console.log(`🗑️ ${admin.id} deleted match ${params.matchId}`);
      return getRound(roundId);
    }
    case "update": {
      const roundId = await updateMatch(params.matchId, body);
      track("admin_match_updated", adminUserId, {
        ...by,
        ...(body.status ? { status: body.status } : {}),
        ...(body.accepted ? { accepted: body.accepted } : {}),
        ...(body.replace ? { replace: body.replace, notify: Boolean(body.notify) } : {}),
      });
      console.log(`✏️ ${admin.id} updated match ${params.matchId}`);
      return getRound(roundId);
    }
    default:
      throw new AdminError("Unknown action", 400);
  }
});
