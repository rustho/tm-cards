import { adminRoute, jsonBody } from "@/lib/adminRoute";
import { createBroadcast, listBroadcasts } from "@/lib/broadcastService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/admin/broadcasts — the latest 30 with delivery counts. */
export const GET = adminRoute("broadcasts", () => listBroadcasts());

/**
 * POST /api/admin/broadcasts — body { text, withAppButton, segment: { id, country? } }.
 * Snapshots the recipients; sending starts with POST /api/admin/broadcasts/[id] { action: "send" }.
 */
export const POST = adminRoute("broadcast create", async (request, { admin }) => {
  const body = await jsonBody(request);
  return createBroadcast(admin.id, { text: body.text, withAppButton: body.withAppButton, segment: body.segment });
});
