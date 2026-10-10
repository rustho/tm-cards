import { adminRoute, jsonBody } from "@/lib/adminRoute";
import { sendToUser } from "@/lib/bot";
import { parseMessage, personalize } from "@/lib/broadcastService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** POST /api/admin/broadcasts/test — { text, withAppButton } sent to the calling admin only. */
export const POST = adminRoute("broadcast test", async (request, { admin }) => {
  const body = await jsonBody(request);
  return sendToUser(admin.id, personalize(parseMessage(body.text), admin.firstName), {
    withAppButton: body.withAppButton !== false,
  });
});
