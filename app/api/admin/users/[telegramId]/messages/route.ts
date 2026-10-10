import prisma from "@/lib/prisma";
import { adminRoute } from "@/lib/adminRoute";
import { AdminError } from "@/lib/adminService";
import type { BotDialogDto, BotMessageDto } from "@/models/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PAGE = 50;

/**
 * GET /api/admin/users/[telegramId]/messages[?before=ISO] — the user's chat with the bot
 * (`bot_messages`, kept since the log shipped), 50 per page, newest last.
 */
export const GET = adminRoute<{ telegramId: string }>("bot dialog", async (request, { params }): Promise<BotDialogDto> => {
  const raw = request.nextUrl.searchParams.get("before");
  const before = raw ? new Date(raw) : null;
  if (before && Number.isNaN(before.getTime())) throw new AdminError("before must be an ISO date", 400);

  const rows = await prisma.botMessage.findMany({
    where: { telegramId: params.telegramId, ...(before ? { createdAt: { lt: before } } : {}) },
    orderBy: { createdAt: "desc" },
    take: PAGE + 1,
  });
  const messages: BotMessageDto[] = rows
    .slice(0, PAGE)
    .reverse()
    .map((m) => ({
      id: m.id,
      direction: m.direction as BotMessageDto["direction"],
      source: m.source as BotMessageDto["source"],
      text: m.text,
      ok: m.ok,
      error: m.error,
      sentBy: m.sentBy,
      broadcastId: m.broadcastId,
      createdAt: m.createdAt.toISOString(),
    }));
  return { messages, hasMore: rows.length > PAGE };
});
