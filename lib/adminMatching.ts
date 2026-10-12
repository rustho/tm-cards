import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import MatchingService from "@/lib/matchingService";
import { notifyUser } from "@/lib/bot";
import { formatDateOnly } from "@/lib/profileDto";
import { AdminError, adminMatchInclude, toAdminMatch } from "@/lib/adminService";
import {
  MATCH_STATUSES,
  type AdminMatchAction,
  type AdminRoundAction,
  type AdminRoundDetails,
  type AdminRoundRow,
} from "@/models/admin";

/** Rounds and pairs for the admin «Матчинг» screen, and editing them by hand (server). */

type RoundCounts = {
  id: string;
  weekStart: Date;
  status: string;
  pairs: bigint;
  mutual: bigint;
  met: bigint;
  notMet: bigint;
};

const toRow = (r: RoundCounts): AdminRoundRow => ({
  roundId: r.id,
  weekStart: formatDateOnly(r.weekStart),
  status: r.status,
  pairs: Number(r.pairs),
  mutual: Number(r.mutual),
  met: Number(r.met),
  notMet: Number(r.notMet),
});

/** One query: rounds newest first with pair counts (expired = cancelled pairs are left out). */
async function roundCounts(roundId?: string): Promise<RoundCounts[]> {
  return prisma.$queryRaw<RoundCounts[]>`
    SELECT r."id", r."weekStart", r."status",
      COUNT(m."id") FILTER (WHERE m."status" <> 'expired') AS "pairs",
      COUNT(m."id") FILTER (WHERE m."user1AcceptedAt" IS NOT NULL AND m."user2AcceptedAt" IS NOT NULL) AS "mutual",
      COUNT(m."id") FILTER (WHERE m."status" = 'met') AS "met",
      COUNT(m."id") FILTER (WHERE m."status" = 'not_met') AS "notMet"
    FROM "match_rounds" r
    LEFT JOIN "matches" m ON m."roundId" = r."id"
    WHERE (${roundId ?? null}::text IS NULL OR r."id" = ${roundId ?? null}::text)
    GROUP BY r."id"
    ORDER BY r."weekStart" DESC
    LIMIT 20`;
}

export async function listRounds(): Promise<AdminRoundRow[]> {
  return (await roundCounts()).map(toRow);
}

export async function getRound(roundId: string): Promise<AdminRoundDetails> {
  const [[counts], matches] = await Promise.all([
    roundCounts(roundId),
    prisma.match.findMany({ where: { roundId }, include: adminMatchInclude, orderBy: { score: "desc" } }),
  ]);
  if (!counts) throw new AdminError("Round not found", 404);
  return { ...toRow(counts), matches: matches.map(toAdminMatch) };
}

/** Removes a pair from the users' screens (status expired). Only while nobody has met yet. */
export async function cancelMatch(matchId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId }, select: { status: true, roundId: true } });
  if (!match) throw new AdminError("Match not found", 404);
  if (!["pending", "postponed"].includes(match.status)) throw new AdminError(`Match is ${match.status}`, 409);
  await prisma.match.update({ where: { id: matchId }, data: { status: "expired" } });
  return match.roundId;
}

// --- editing -------------------------------------------------------------------------

const MATCH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Users by Telegram id; AdminError(404) names the missing one. */
async function usersByTelegramId(telegramIds: string[]) {
  const users = await prisma.user.findMany({
    where: { telegramId: { in: telegramIds } },
    select: { id: true, telegramId: true, firstName: true, profile: { select: { name: true } } },
  });
  for (const id of telegramIds) {
    if (!users.some((u) => u.telegramId === id)) throw new AdminError(`User ${id} not found`, 404);
  }
  return telegramIds.map((id) => users.find((u) => u.telegramId === id)!);
}

/** One person, one pair per round: 409 when someone already has another live pair in it. */
async function assertFreeInRound(roundId: string, userIds: string[], exceptMatchId?: string) {
  const clash = await prisma.match.findFirst({
    where: {
      roundId,
      status: { not: "expired" },
      ...(exceptMatchId ? { id: { not: exceptMatchId } } : {}),
      OR: [{ user1Id: { in: userIds } }, { user2Id: { in: userIds } }],
    },
    select: {
      user1: { select: { firstName: true, profile: { select: { name: true } } } },
      user2: { select: { firstName: true, profile: { select: { name: true } } } },
    },
  });
  if (clash) {
    throw new AdminError(`Уже в паре в этом раунде: ${nameOf(clash.user1)} ↔ ${nameOf(clash.user2)}. Сначала удалите или измените ту пару.`, 409);
  }
}

const nameOf = (u: { firstName: string | null; profile: { name: string | null } | null }) =>
  (u.profile?.name || u.firstName || "Путешественник").replace(/[<>&]/g, "");

/** «New pair» bot message for a pair created or changed by hand. Returns how many were sent. */
async function notifyPair(a: Awaited<ReturnType<typeof usersByTelegramId>>[number], b: typeof a) {
  const text = (partner: typeof a) =>
    `🎯 <b>У тебя новая пара на этой неделе:</b> ${nameOf(partner)}.\n\nОткрой «Встречи» в TravelMate, чтобы познакомиться.`;
  const sent = await Promise.all([notifyUser(a.telegramId, text(b)), notifyUser(b.telegramId, text(a))]);
  return sent.filter(Boolean).length;
}

/** Deletes a pair for good (feedback goes with it), in any round. Returns its round id. */
export async function deleteMatch(matchId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId }, include: adminMatchInclude });
  if (!match) throw new AdminError("Match not found", 404);
  await prisma.match.delete({ where: { id: matchId } });
  return { roundId: match.roundId, snapshot: toAdminMatch(match) };
}

export async function updateMatch(matchId: string, input: Extract<AdminMatchAction, { action: "update" }>) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new AdminError("Match not found", 404);

  if (input.replace) {
    const { side, telegramId } = input.replace;
    const [incoming] = await usersByTelegramId([telegramId]);
    const keepId = side === "a" ? match.user2Id : match.user1Id;
    if (incoming.id === keepId) throw new AdminError("A user cannot be paired with themselves", 400);
    await assertFreeInRound(match.roundId, [incoming.id], matchId);

    const [user1Id, user2Id] = [keepId, incoming.id].sort();
    const exists = await prisma.match.findFirst({ where: { roundId: match.roundId, user1Id, user2Id, id: { not: matchId } } });
    if (exists) throw new AdminError("This pair already exists in the round", 409);

    const { score, factors } = await MatchingService.getInstance().scorePair(user1Id, user2Id);
    // A different person: everything said about the old pair no longer applies.
    await prisma.$transaction([
      prisma.matchFeedback.deleteMany({ where: { matchId } }),
      prisma.match.update({
        where: { id: matchId },
        data: {
          user1Id,
          user2Id,
          score,
          factors: factors as unknown as Prisma.InputJsonValue,
          status: "pending",
          user1AcceptedAt: null,
          user2AcceptedAt: null,
          notifiedAt: null,
        },
      }),
      prisma.user.update({ where: { id: incoming.id }, data: { lastMatchedAt: new Date() } }),
    ]);
    if (input.notify) {
      const [keep] = await prisma.user.findMany({
        where: { id: keepId },
        select: { id: true, telegramId: true, firstName: true, profile: { select: { name: true } } },
      });
      if (keep && (await notifyPair(keep, incoming)) > 0) {
        await prisma.match.update({ where: { id: matchId }, data: { notifiedAt: new Date() } });
      }
    }
    return match.roundId;
  }

  const data: Prisma.MatchUpdateInput = {};
  if (input.status !== undefined) {
    if (!(MATCH_STATUSES as readonly string[]).includes(input.status)) throw new AdminError("Unknown status", 400);
    data.status = input.status;
  }
  for (const side of ["a", "b"] as const) {
    const value = input.accepted?.[side];
    if (value === undefined) continue;
    const field = side === "a" ? "user1AcceptedAt" : "user2AcceptedAt";
    data[field] = value ? match[field] ?? new Date() : null;
  }
  if (Object.keys(data).length === 0) throw new AdminError("Nothing to change", 400);
  await prisma.match.update({ where: { id: matchId }, data });
  return match.roundId;
}

/** A pair added by hand to any round (the engine's rules are not applied, except one pair per person). */
export async function createMatch(roundId: string, input: AdminRoundAction) {
  const round = await prisma.matchRound.findUnique({ where: { id: roundId } });
  if (!round) throw new AdminError("Round not found", 404);
  if (input.a === input.b) throw new AdminError("Pick two different users", 400);
  const [a, b] = await usersByTelegramId([input.a, input.b]);
  await assertFreeInRound(roundId, [a.id, b.id]);

  const [user1Id, user2Id] = [a.id, b.id].sort();
  const { score, factors } = await MatchingService.getInstance().scorePair(user1Id, user2Id);
  const now = new Date();
  const created = await prisma.$transaction(async (tx) => {
    const match = await tx.match.create({
      data: {
        roundId,
        user1Id,
        user2Id,
        score,
        factors: factors as unknown as Prisma.InputJsonValue,
        expiresAt: new Date(now.getTime() + MATCH_TTL_MS),
      },
    });
    await tx.user.updateMany({ where: { id: { in: [user1Id, user2Id] } }, data: { lastMatchedAt: now } });
    return match;
  });
  if (input.notify && (await notifyPair(a, b)) > 0) {
    await prisma.match.update({ where: { id: created.id }, data: { notifiedAt: new Date() } });
  }
  return created.id;
}
