import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { sendToUser } from "@/lib/bot";
import { track } from "@/lib/events";
import { AdminError, findUserId, segmentWhere } from "@/lib/adminService";
import {
  BROADCAST_SEGMENTS,
  MESSAGE_MAX_LENGTH,
  type BroadcastAudience,
  type BroadcastDetails,
  type BroadcastDto,
  type BroadcastSegment,
  type BroadcastStatus,
} from "@/models/admin";

/**
 * Bot broadcasts (server). Creating one snapshots the reachable users of the
 * segment into `broadcast_deliveries`; the admin screen then calls
 * processBroadcast() repeatedly, each call sending for a bounded time at
 * ~25 messages/s (Telegram allows ~30/s per bot). Rows are claimed with
 * SKIP LOCKED, so two open admin screens never send the same message twice.
 */

const SEND_INTERVAL_MS = 40;
const CLAIM_BATCH = 10;

export function parseSegment(input: unknown): BroadcastSegment {
  const raw = (input ?? {}) as Record<string, unknown>;
  const id = raw.id;
  if (typeof id !== "string" || !(BROADCAST_SEGMENTS as readonly string[]).includes(id)) {
    throw new AdminError("Unknown segment", 400);
  }
  const country = typeof raw.country === "string" && raw.country.trim() ? raw.country.trim() : undefined;
  return { id: id as BroadcastSegment["id"], ...(country ? { country } : {}) };
}

export function parseMessage(input: unknown): string {
  const text = typeof input === "string" ? input.trim() : "";
  if (!text) throw new AdminError("Message is empty", 400);
  if (text.length > MESSAGE_MAX_LENGTH) throw new AdminError(`Message is longer than ${MESSAGE_MAX_LENGTH}`, 400);
  return text;
}

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** `{name}` → the recipient's profile or Telegram name (HTML-escaped). */
export function personalize(text: string, name: string | null | undefined): string {
  return text.replace(/\{name\}/g, escapeHtml(name || "друг"));
}

export async function getAudience(segment: BroadcastSegment): Promise<BroadcastAudience> {
  const base = segmentWhere(segment);
  const [total, reachable] = await Promise.all([
    prisma.user.count({ where: base }),
    prisma.user.count({ where: { AND: [base, { botBlockedAt: null }] } }),
  ]);
  return { total, reachable };
}

export async function createBroadcast(
  adminTelegramId: string,
  input: { text: unknown; withAppButton: unknown; segment: unknown }
): Promise<BroadcastDto> {
  const text = parseMessage(input.text);
  const segment = parseSegment(input.segment);
  const withAppButton = input.withAppButton !== false;

  const recipients = await prisma.user.findMany({
    where: { AND: [segmentWhere(segment), { botBlockedAt: null }] },
    select: { id: true },
  });
  if (recipients.length === 0) throw new AdminError("Nobody to send to", 400);

  const broadcast = await prisma.broadcast.create({
    data: {
      text,
      withAppButton,
      segment: segment as unknown as Prisma.InputJsonValue,
      total: recipients.length,
      createdBy: adminTelegramId,
    },
  });
  await prisma.broadcastDelivery.createMany({
    data: recipients.map((r) => ({ broadcastId: broadcast.id, userId: r.id })),
  });

  track("admin_broadcast", await findUserId(adminTelegramId).catch(() => null), {
    broadcastId: broadcast.id,
    segment,
    total: recipients.length,
  });
  console.log(`📣 Broadcast ${broadcast.id} to ${recipients.length} users (${segment.id}) by ${adminTelegramId}`);
  return (await getBroadcast(broadcast.id)) as BroadcastDto;
}

async function countsOf(broadcastIds: string[]) {
  const rows = broadcastIds.length
    ? await prisma.broadcastDelivery.groupBy({
        by: ["broadcastId", "status"],
        where: { broadcastId: { in: broadcastIds } },
        _count: { _all: true },
      })
    : [];
  const counts = new Map<string, BroadcastDto["counts"]>();
  for (const row of rows) {
    const c = counts.get(row.broadcastId) ?? { pending: 0, sent: 0, blocked: 0, failed: 0 };
    // `sending` = claimed by a call that is still running: shown as pending.
    const key = row.status === "sending" ? "pending" : (row.status as keyof BroadcastDto["counts"]);
    if (key in c) c[key] += row._count._all;
    counts.set(row.broadcastId, c);
  }
  return counts;
}

type BroadcastRow = Prisma.BroadcastGetPayload<object>;

function toDto(row: BroadcastRow, counts: BroadcastDto["counts"] | undefined): BroadcastDto {
  return {
    id: row.id,
    text: row.text,
    withAppButton: row.withAppButton,
    segment: row.segment as unknown as BroadcastSegment,
    status: row.status as BroadcastStatus,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
    finishedAt: row.finishedAt?.toISOString() ?? null,
    total: row.total,
    counts: counts ?? { pending: 0, sent: 0, blocked: 0, failed: 0 },
  };
}

export async function listBroadcasts(): Promise<BroadcastDto[]> {
  const rows = await prisma.broadcast.findMany({ orderBy: { createdAt: "desc" }, take: 30 });
  const counts = await countsOf(rows.map((r) => r.id));
  return rows.map((r) => toDto(r, counts.get(r.id)));
}

export async function getBroadcast(id: string): Promise<BroadcastDetails> {
  const [row, counts, failures] = await Promise.all([
    prisma.broadcast.findUnique({ where: { id } }),
    countsOf([id]),
    prisma.broadcastDelivery.findMany({
      where: { broadcastId: id, status: { in: ["blocked", "failed"] } },
      include: { user: { select: { telegramId: true, firstName: true, profile: { select: { name: true } } } } },
      take: 100,
    }),
  ]);
  if (!row) throw new AdminError("Broadcast not found", 404);
  return {
    ...toDto(row, counts.get(id)),
    failures: failures.map((f) => ({
      telegramId: f.user.telegramId,
      name: f.user.profile?.name || f.user.firstName || "—",
      status: f.status as "blocked" | "failed",
      error: f.error,
    })),
  };
}

/** Claims up to CLAIM_BATCH pending deliveries (pending → sending) and returns them with names. */
async function claimBatch(broadcastId: string) {
  return prisma.$queryRaw<{ userId: string; telegramId: string; name: string | null }[]>`
    WITH claimed AS (
      UPDATE "broadcast_deliveries" SET "status" = 'sending'
      WHERE ("broadcastId", "userId") IN (
        SELECT "broadcastId", "userId" FROM "broadcast_deliveries"
        WHERE "broadcastId" = ${broadcastId} AND "status" = 'pending'
        LIMIT ${CLAIM_BATCH}
        FOR UPDATE SKIP LOCKED
      )
      RETURNING "userId"
    )
    SELECT c."userId", u."telegramId", COALESCE(p."name", u."firstName") AS "name"
    FROM claimed c
    JOIN "users" u ON u."id" = c."userId"
    LEFT JOIN "profiles" p ON p."userId" = c."userId"`;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Sends pending messages for up to `budgetMs`, then returns the fresh state.
 * Marks the broadcast done when nothing is left to send.
 */
export async function processBroadcast(id: string, budgetMs: number): Promise<BroadcastDetails> {
  const broadcast = await prisma.broadcast.findUnique({ where: { id } });
  if (!broadcast) throw new AdminError("Broadcast not found", 404);
  if (broadcast.status !== "sending") return getBroadcast(id);

  const deadline = Date.now() + budgetMs;
  while (Date.now() < deadline) {
    const batch = await claimBatch(id);
    if (batch.length === 0) break;
    for (const recipient of batch) {
      const started = Date.now();
      const result = await sendToUser(recipient.telegramId, personalize(broadcast.text, recipient.name), {
        withAppButton: broadcast.withAppButton,
      });
      await prisma.broadcastDelivery.update({
        where: { broadcastId_userId: { broadcastId: id, userId: recipient.userId } },
        data: result.ok
          ? { status: "sent", sentAt: new Date(), error: null }
          : { status: result.blocked ? "blocked" : "failed", error: result.error.slice(0, 500) },
      });
      const wait = SEND_INTERVAL_MS - (Date.now() - started);
      if (wait > 0) await sleep(wait);
    }
  }

  const pending = await prisma.broadcastDelivery.count({ where: { broadcastId: id, status: { in: ["pending", "sending"] } } });
  if (pending === 0) {
    await prisma.broadcast.updateMany({ where: { id, status: "sending" }, data: { status: "done", finishedAt: new Date() } });
    console.log(`✅ Broadcast ${id} finished`);
  }
  return getBroadcast(id);
}

export async function cancelBroadcast(id: string): Promise<BroadcastDetails> {
  await prisma.broadcast.updateMany({ where: { id, status: "sending" }, data: { status: "cancelled", finishedAt: new Date() } });
  return getBroadcast(id);
}
