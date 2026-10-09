import prisma from "@/lib/prisma";
import { MEETINGS_TIMEZONE, WEEK_SCHEDULE, type WeekTime } from "@/config/constants";
import type { WeekPhase } from "@/models/types";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** Offset of a WEEK_SCHEDULE moment from Monday 00:00. */
const offsetOf = ({ day, hour }: WeekTime) => (day - 1) * DAY_MS + hour * HOUR_MS;

/** UTC instant of local midnight in MEETINGS_TIMEZONE for the calendar date of `utcDate`. */
function zonedMidnight(utcDate: Date): Date {
  const asZone = new Date(utcDate.toLocaleString("en-US", { timeZone: MEETINGS_TIMEZONE }));
  const asUtc = new Date(utcDate.toLocaleString("en-US", { timeZone: "UTC" }));
  return new Date(utcDate.getTime() - (asZone.getTime() - asUtc.getTime()));
}

/**
 * When the round of `weekStart` (its Monday, a UTC DATE) stops accepting «Хочу познакомиться»:
 * WEEK_SCHEDULE.agreeDeadline in MEETINGS_TIMEZONE. Fixed offsets: fine for zones without DST.
 * MEETINGS_PHASE=week (testing) keeps it open until the end of the round's week.
 */
export function agreeDeadline(weekStart: Date): Date {
  const offset = process.env.MEETINGS_PHASE === "week" ? 7 * DAY_MS : offsetOf(WEEK_SCHEDULE.agreeDeadline);
  return new Date(zonedMidnight(weekStart).getTime() + offset);
}

/** Phase of the weekly cycle at `now` (see WEEK_SCHEDULE); MEETINGS_PHASE overrides. */
export function getWeekPhase(now = new Date()): WeekPhase {
  const override = process.env.MEETINGS_PHASE;
  if (override === "week" || override === "feedback" || override === "signup") return override;

  // Wall-clock time in the zone, read through Date getters (no DST math needed for a weekday offset).
  const local = new Date(now.toLocaleString("en-US", { timeZone: MEETINGS_TIMEZONE }));
  const sinceMonday =
    ((local.getDay() + 6) % 7) * DAY_MS + local.getHours() * HOUR_MS + local.getMinutes() * 60_000;

  if (sinceMonday < offsetOf(WEEK_SCHEDULE.agreeDeadline)) return "week";
  if (sinceMonday < offsetOf(WEEK_SCHEDULE.signupStart)) return "feedback";
  return "signup";
}

/**
 * Pairs that did not both press «Хочу познакомиться» before their round's deadline
 * become `not_met`. Runs before matching for everyone, and lazily for one user on read.
 */
export async function closeUnagreedMatches(userId?: string): Promise<number> {
  const now = new Date();
  const rounds = await prisma.matchRound.findMany({ where: { weekStart: { lte: now } }, select: { id: true, weekStart: true } });
  const closedRounds = rounds.filter((r) => agreeDeadline(r.weekStart) < now).map((r) => r.id);
  if (closedRounds.length === 0) return 0;

  const result = await prisma.match.updateMany({
    where: {
      roundId: { in: closedRounds },
      status: "pending",
      AND: [
        { OR: [{ user1AcceptedAt: null }, { user2AcceptedAt: null }] },
        ...(userId ? [{ OR: [{ user1Id: userId }, { user2Id: userId }] }] : []),
      ],
    },
    data: { status: "not_met" },
  });
  if (result.count > 0) console.log(`⌛ ${result.count} unagreed matches → not_met`);
  return result.count;
}
