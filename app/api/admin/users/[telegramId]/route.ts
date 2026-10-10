import prisma from "@/lib/prisma";
import { adminRoute, jsonBody } from "@/lib/adminRoute";
import { forgetUser } from "@/lib/auth";
import { track } from "@/lib/events";
import { AdminError, findUserId, getUserDetails, grantAccess, revokeAccess } from "@/lib/adminService";
import { USER_STATUSES, type UserStatus } from "@/models/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { telegramId: string };

/** GET /api/admin/users/[telegramId] — the admin user card. */
export const GET = adminRoute<Params>("user", (_request, { params }) => getUserDetails(params.telegramId));

/**
 * POST /api/admin/users/[telegramId] — body:
 * { action: "setStatus", status } | { action: "grantAccess", weeks } | { action: "revokeAccess" }.
 * Returns the updated card.
 */
export const POST = adminRoute<Params>("user action", async (request, { admin, params }) => {
  const body = await jsonBody(request);
  const userId = await findUserId(params.telegramId);
  const by = { by: admin.id };

  switch (body.action) {
    case "setStatus": {
      const status = body.status as UserStatus;
      if (!USER_STATUSES.includes(status)) throw new AdminError("Unknown status", 400);
      await prisma.user.update({ where: { id: userId }, data: { status } });
      forgetUser(params.telegramId);
      track("admin_user_status", userId, { ...by, status });
      console.log(`🛡️ ${admin.id} set ${params.telegramId} status=${status}`);
      break;
    }
    case "grantAccess": {
      const weeks = Number(body.weeks);
      const sub = await grantAccess(userId, weeks);
      track("admin_access_granted", userId, { ...by, weeks, endsAt: sub.endsAt.toISOString() });
      console.log(`💎 ${admin.id} granted ${weeks}w to ${params.telegramId}`);
      break;
    }
    case "revokeAccess": {
      const count = await revokeAccess(userId);
      track("admin_access_revoked", userId, { ...by, count });
      break;
    }
    default:
      throw new AdminError("Unknown action", 400);
  }
  return getUserDetails(params.telegramId);
});
