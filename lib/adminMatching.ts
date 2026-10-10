import prisma from "@/lib/prisma";
import { formatDateOnly } from "@/lib/profileDto";
import { AdminError, adminMatchInclude, toAdminMatch } from "@/lib/adminService";
import type { AdminRoundDetails, AdminRoundRow } from "@/models/admin";

/** Rounds and pairs for the admin «Матчинг» screen (server). */

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
