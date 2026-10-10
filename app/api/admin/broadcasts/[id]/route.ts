import { adminRoute, jsonBody } from "@/lib/adminRoute";
import { AdminError } from "@/lib/adminService";
import { cancelBroadcast, getBroadcast, processBroadcast } from "@/lib/broadcastService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/** Sending time per call; the admin screen calls again until the broadcast is done. */
const SEND_BUDGET_MS = 40_000;

/** GET /api/admin/broadcasts/[id] — counts and failed deliveries. */
export const GET = adminRoute<{ id: string }>("broadcast", (_request, { params }) => getBroadcast(params.id));

/** POST /api/admin/broadcasts/[id] — { action: "send" } sends a batch (~40 s); { action: "cancel" } stops it. */
export const POST = adminRoute<{ id: string }>("broadcast action", async (request, { params }) => {
  const body = await jsonBody(request);
  if (body.action === "send") return processBroadcast(params.id, SEND_BUDGET_MS);
  if (body.action === "cancel") return cancelBroadcast(params.id);
  throw new AdminError("Unknown action", 400);
});
