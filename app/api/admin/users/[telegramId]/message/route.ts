import { adminRoute, jsonBody } from "@/lib/adminRoute";
import { sendToUser } from "@/lib/bot";
import { track } from "@/lib/events";
import { findUserId } from "@/lib/adminService";
import { parseMessage, personalize } from "@/lib/broadcastService";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/admin/users/[telegramId]/message — body { text, withAppButton? }.
 * Sends a bot message (HTML, {name} placeholder) and logs it as an `admin_message` event.
 */
export const POST = adminRoute<{ telegramId: string }>("message", async (request, { admin, params }) => {
  const body = await jsonBody(request);
  const text = parseMessage(body.text);
  const userId = await findUserId(params.telegramId);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, profile: { select: { name: true } } },
  });
  const result = await sendToUser(params.telegramId, personalize(text, user?.profile?.name || user?.firstName), {
    withAppButton: body.withAppButton !== false,
  });
  track("admin_message", userId, { by: admin.id, text, ok: result.ok, ...(result.ok ? {} : { error: result.error }) });
  console.log(`✉️ ${admin.id} → ${params.telegramId}: ${result.ok ? "sent" : result.error}`);
  return result;
});
