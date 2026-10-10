import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { FUNNEL_STEPS, type FunnelCounts, type FunnelDto, type FunnelPeriod, type FunnelSource } from "@/models/admin";

/**
 * Funnel and sign-up cohorts for /admin/funnel (server). Steps after sign-up
 * are read from the core tables (profiles, matches, match_feedback,
 * subscriptions), so they cover the whole history; only the wizard drop-off
 * needs `events` (`onboarding_step`), which exist since that event shipped.
 * Columns are UTC `timestamp`s; they are compared as `AT TIME ZONE 'UTC'` so the
 * result does not depend on the DB session time zone.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

type WeekRow = { week: Date } & { [K in keyof FunnelCounts]: number };

export async function getFunnel(period: FunnelPeriod, source: FunnelSource): Promise<FunnelDto> {
  const to = new Date();
  const from = period === "all" ? null : new Date(to.getTime() - Number(period) * DAY_MS);

  const cohort = Prisma.sql`
    SELECT u."id", u."createdAt", u."botBlockedAt", u."referrerId",
      p."userId" IS NOT NULL AS "hasProfile", p."completedAt"
    FROM "users" u
    LEFT JOIN "profiles" p ON p."userId" = u."id"
    WHERE (u."createdAt" AT TIME ZONE 'UTC') < ${to}::timestamptz
      AND (${from}::timestamptz IS NULL OR (u."createdAt" AT TIME ZONE 'UTC') >= ${from}::timestamptz)
      AND u."telegramId" NOT LIKE 'mock\\_%'
      AND (${source} = 'all' OR (${source} = 'referral') = (u."referrerId" IS NOT NULL))`;

  const [weeks, median, firstStepEvent] = await Promise.all([
    prisma.$queryRaw<WeekRow[]>`
      WITH cohort AS (${cohort}),
      flags AS (
        SELECT c.*,
          EXISTS (SELECT 1 FROM "matches" m WHERE c."id" IN (m."user1Id", m."user2Id")) AS "matched",
          EXISTS (SELECT 1 FROM "matches" m WHERE (m."user1Id" = c."id" AND m."user1AcceptedAt" IS NOT NULL)
                                              OR (m."user2Id" = c."id" AND m."user2AcceptedAt" IS NOT NULL)) AS "accepted",
          EXISTS (SELECT 1 FROM "matches" m WHERE c."id" IN (m."user1Id", m."user2Id")
                    AND m."user1AcceptedAt" IS NOT NULL AND m."user2AcceptedAt" IS NOT NULL) AS "mutual",
          EXISTS (SELECT 1 FROM "match_feedback" f WHERE f."authorId" = c."id") AS "feedback",
          EXISTS (SELECT 1 FROM "matches" m WHERE c."id" IN (m."user1Id", m."user2Id") AND m."status" = 'met') AS "met",
          EXISTS (SELECT 1 FROM "subscriptions" s JOIN "plans" pl ON pl."id" = s."planId"
                  WHERE s."userId" = c."id" AND pl."code" <> 'manual') AS "subscribed"
        FROM cohort c
      )
      SELECT date_trunc('week', "createdAt")::date AS "week",
        COUNT(*)::int AS "users",
        COUNT(*) FILTER (WHERE "hasProfile")::int AS "started",
        COUNT("completedAt")::int AS "completed",
        COUNT(*) FILTER (WHERE "matched")::int AS "matched",
        COUNT(*) FILTER (WHERE "accepted")::int AS "accepted",
        COUNT(*) FILTER (WHERE "mutual")::int AS "mutual",
        COUNT(*) FILTER (WHERE "feedback")::int AS "feedback",
        COUNT(*) FILTER (WHERE "met")::int AS "met",
        COUNT(*) FILTER (WHERE "subscribed")::int AS "subscribed",
        COUNT("referrerId")::int AS "referred",
        COUNT("botBlockedAt")::int AS "blocked"
      FROM flags
      GROUP BY 1
      ORDER BY 1 DESC`,
    prisma.$queryRaw<{ hours: number | null }[]>`
      WITH cohort AS (${cohort})
      SELECT (percentile_cont(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM "completedAt" - "createdAt")) / 3600)::float AS "hours"
      FROM cohort WHERE "completedAt" IS NOT NULL`,
    prisma.event.findFirst({ where: { name: "onboarding_step" }, orderBy: { createdAt: "asc" }, select: { createdAt: true } }),
  ]);

  const empty = (): FunnelCounts =>
    Object.fromEntries([...FUNNEL_STEPS, "feedback", "referred", "blocked"].map((k) => [k, 0])) as FunnelCounts;
  const totals = empty();
  for (const row of weeks) for (const key of Object.keys(totals) as (keyof FunnelCounts)[]) totals[key] += row[key];

  // Step data exists only for users who signed up after the first step event (minus a minute:
  // the very first user's row is created just before their first event).
  const since = firstStepEvent ? new Date(firstStepEvent.createdAt.getTime() - 60_000) : null;
  const [wizardUsers, steps] = since
    ? await Promise.all([
        prisma.$queryRaw<{ n: number }[]>`
          WITH cohort AS (${cohort})
          SELECT COUNT(*)::int AS "n" FROM cohort WHERE ("createdAt" AT TIME ZONE 'UTC') >= ${since}::timestamptz`,
        prisma.$queryRaw<{ step: string; users: number }[]>`
          WITH cohort AS (${cohort})
          SELECT e."props"->>'step' AS "step", COUNT(DISTINCT e."userId")::int AS "users"
          FROM "events" e JOIN cohort c ON c."id" = e."userId"
          WHERE e."name" = 'onboarding_step' AND (c."createdAt" AT TIME ZONE 'UTC') >= ${since}::timestamptz
          GROUP BY 1`,
      ])
    : [[{ n: 0 }], []];

  return {
    period,
    source,
    from: from?.toISOString() ?? null,
    to: to.toISOString(),
    totals,
    weeks: weeks.map(({ week, ...counts }) => ({ week: week.toISOString().slice(0, 10), ...counts })),
    medianHoursToComplete: median[0]?.hours ?? null,
    wizard: { since: since?.toISOString() ?? null, users: wizardUsers[0]?.n ?? 0, steps },
  };
}
