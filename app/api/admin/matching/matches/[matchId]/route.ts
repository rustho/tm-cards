import { adminRoute, jsonBody } from "@/lib/adminRoute";
import { AdminError, findUserId } from "@/lib/adminService";
import { cancelMatch, getRound } from "@/lib/adminMatching";
import { track } from "@/lib/events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** POST /api/admin/matching/matches/[matchId] — { action: "cancel" }; returns the updated round. */
export const POST = adminRoute<{ matchId: string }>("match action", async (request, { admin, params }) => {
  const body = await jsonBody(request);
  if (body.action !== "cancel") throw new AdminError("Unknown action", 400);
  const roundId = await cancelMatch(params.matchId);
  track("admin_match_cancelled", await findUserId(admin.id).catch(() => null), { by: admin.id, matchId: params.matchId });
  console.log(`✂️ ${admin.id} cancelled match ${params.matchId}`);
  return getRound(roundId);
});
