import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { TRIAL_DAYS } from "@/config/constants";
import { isParticipating } from "@/lib/meetingsService";
import { weekStartOf } from "@/lib/matchingService";
import { getWeekPhase } from "@/lib/weekCycle";
import { formatDateOnly } from "@/lib/profileDto";
import type {
  AccessKind,
  AdminMatchRow,
  AdminOverview,
  AdminPerson,
  AdminUserDetails,
  AdminUserList,
  AdminUserRow,
  BroadcastSegment,
  ProfileState,
  UserFilter,
  UserStatus,
} from "@/models/admin";

/** Read side of the admin: user lists, user card, overview and broadcast segments (server). */

const DAY_MS = 24 * 60 * 60 * 1000;
export const USER_PAGE_SIZE = 50;

export class AdminError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

const trialStart = (now: Date) => new Date(now.getTime() - TRIAL_DAYS * DAY_MS);
const activeSubscription = (now: Date): Prisma.SubscriptionListRelationFilter => ({
  some: { status: "active", endsAt: { gt: now } },
});

/** Where-clauses shared by the user filters and the broadcast segments. */
const where = {
  complete: (): Prisma.UserWhereInput => ({ profile: { isComplete: true } }),
  incomplete: (): Prisma.UserWhereInput => ({ OR: [{ profile: null }, { profile: { isComplete: false } }] }),
  subscribed: (now: Date): Prisma.UserWhereInput => ({ subscriptions: activeSubscription(now) }),
  trial: (now: Date): Prisma.UserWhereInput => ({
    createdAt: { gt: trialStart(now) },
    NOT: { subscriptions: activeSubscription(now) },
  }),
  noAccess: (now: Date): Prisma.UserWhereInput => ({
    createdAt: { lte: trialStart(now) },
    NOT: { subscriptions: activeSubscription(now) },
  }),
};

function filterWhere(filter: UserFilter, now: Date): Prisma.UserWhereInput {
  switch (filter) {
    case "complete":
      return where.complete();
    case "incomplete":
      return where.incomplete();
    case "trial":
      return where.trial(now);
    case "subscribed":
      return where.subscribed(now);
    case "no_access":
      return where.noAccess(now);
    case "blocked":
      return { botBlockedAt: { not: null } };
    case "banned":
      return { status: { not: "active" } };
    default:
      return {};
  }
}

function searchWhere(q: string): Prisma.UserWhereInput {
  const text = q.trim().replace(/^@/, "");
  if (!text) return {};
  const contains = { contains: text, mode: "insensitive" as const };
  return {
    OR: [
      { telegramId: text },
      { username: contains },
      { firstName: contains },
      { lastName: contains },
      { profile: { name: contains } },
    ],
  };
}

const rowInclude = {
  profile: {
    select: {
      name: true,
      photo: true,
      isComplete: true,
      location: { select: { country: true, region: true } },
    },
  },
  subscriptions: { where: { status: "active" }, orderBy: { endsAt: "desc" }, take: 1, select: { endsAt: true } },
} satisfies Prisma.UserInclude;

type RowUser = Prisma.UserGetPayload<{ include: typeof rowInclude }>;

const displayName = (user: { firstName: string | null; lastName: string | null; profile?: { name: string | null } | null }) =>
  user.profile?.name || [user.firstName, user.lastName].filter(Boolean).join(" ") || "—";

function accessOf(user: { createdAt: Date; subscriptions: { endsAt: Date }[] }, now: Date): { kind: AccessKind; endsAt: string | null } {
  const sub = user.subscriptions.find((s) => s.endsAt > now);
  if (sub) return { kind: "subscription", endsAt: sub.endsAt.toISOString() };
  const trialEnds = new Date(user.createdAt.getTime() + TRIAL_DAYS * DAY_MS);
  return trialEnds > now ? { kind: "trial", endsAt: trialEnds.toISOString() } : { kind: "none", endsAt: trialEnds.toISOString() };
}

function toRow(user: RowUser, now: Date): AdminUserRow {
  const p = user.profile;
  const profile: ProfileState = !p ? "none" : p.isComplete ? "complete" : "draft";
  return {
    telegramId: user.telegramId,
    name: displayName(user),
    username: user.username ?? "",
    photo: p?.photo?.startsWith("http") ? p.photo : "",
    place: p?.location ? [p.location.region, p.location.country].filter(Boolean).join(", ") : "",
    status: user.status as UserStatus,
    profile,
    access: accessOf(user, now),
    botBlocked: Boolean(user.botBlockedAt),
    createdAt: user.createdAt.toISOString(),
    lastSeenAt: user.lastSeenAt?.toISOString() ?? null,
  };
}

export async function listUsers({ q = "", filter = "all", offset = 0 }: { q?: string; filter?: UserFilter; offset?: number }): Promise<AdminUserList> {
  const now = new Date();
  const whereClause: Prisma.UserWhereInput = { AND: [filterWhere(filter, now), searchWhere(q)] };
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      include: rowInclude,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: USER_PAGE_SIZE,
    }),
    prisma.user.count({ where: whereClause }),
  ]);
  return { users: users.map((u) => toRow(u, now)), total, offset, limit: USER_PAGE_SIZE };
}

// --- matches -----------------------------------------------------------------------

const personSelect = {
  telegramId: true,
  username: true,
  firstName: true,
  lastName: true,
  profile: { select: { name: true } },
} satisfies Prisma.UserSelect;

export const adminMatchInclude = {
  round: { select: { weekStart: true } },
  user1: { select: personSelect },
  user2: { select: personSelect },
  feedback: true,
} satisfies Prisma.MatchInclude;

type AdminMatch = Prisma.MatchGetPayload<{ include: typeof adminMatchInclude }>;

const toPerson = (user: Prisma.UserGetPayload<{ select: typeof personSelect }>): AdminPerson => ({
  telegramId: user.telegramId,
  name: displayName(user),
  username: user.username ?? "",
});

export function toAdminMatch(match: AdminMatch): AdminMatchRow {
  const side = (userId: string, user: AdminMatch["user1"], acceptedAt: Date | null) => {
    const f = match.feedback.find((x) => x.authorId === userId);
    return {
      ...toPerson(user),
      acceptedAt: acceptedAt?.toISOString() ?? null,
      feedback: f
        ? { met: f.met, impressions: f.impressions, reason: f.reason, text: f.text, createdAt: f.createdAt.toISOString() }
        : null,
    };
  };
  return {
    matchId: match.id,
    roundId: match.roundId,
    weekStart: formatDateOnly(match.round.weekStart),
    status: match.status,
    score: match.score,
    createdAt: match.createdAt.toISOString(),
    a: side(match.user1Id, match.user1, match.user1AcceptedAt),
    b: side(match.user2Id, match.user2, match.user2AcceptedAt),
  };
}

// --- user card ---------------------------------------------------------------------

export async function getUserDetails(telegramId: string): Promise<AdminUserDetails> {
  const user = await prisma.user.findUnique({
    where: { telegramId },
    include: {
      profile: { include: { location: true, tags: { include: { tag: true } } } },
      settings: true,
      referrer: { select: personSelect },
      subscriptions: { include: { plan: { select: { code: true } } }, orderBy: { endsAt: "desc" } },
      _count: { select: { referrals: true } },
    },
  });
  if (!user) throw new AdminError("User not found", 404);

  const [matches, events] = await Promise.all([
    prisma.match.findMany({
      where: { OR: [{ user1Id: user.id }, { user2Id: user.id }] },
      include: adminMatchInclude,
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.event.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 60 }),
  ]);

  const now = new Date();
  const p = user.profile;
  const tags = (category: string) => p?.tags.filter((t) => t.tag.category === category).map((t) => t.tag.label) ?? [];
  const row = toRow({ ...user, profile: p, subscriptions: user.subscriptions.filter((s) => s.status === "active") }, now);

  return {
    ...row,
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    occupation: p?.occupation ?? "",
    about: p?.about ?? "",
    dateOfBirth: formatDateOnly(p?.dateOfBirth),
    gender: p?.gender ?? "",
    interests: tags("interest"),
    values: tags("value"),
    meetingFormats: tags("format"),
    goals: p?.goals ?? [],
    completedAt: p?.completedAt?.toISOString() ?? null,
    trialEndsAt: new Date(user.createdAt.getTime() + TRIAL_DAYS * DAY_MS).toISOString(),
    participating: isParticipating(user.settings),
    referrer: user.referrer ? toPerson(user.referrer) : null,
    referrals: user._count.referrals,
    subscriptions: user.subscriptions.map((s) => ({
      id: s.id,
      plan: s.plan.code,
      status: s.status,
      startedAt: s.startedAt.toISOString(),
      endsAt: s.endsAt.toISOString(),
    })),
    matches: matches.map(toAdminMatch),
    events: events.map((e) => ({
      id: e.id,
      name: e.name,
      props: (e.props ?? null) as Record<string, unknown> | null,
      createdAt: e.createdAt.toISOString(),
    })),
  };
}

export async function findUserId(telegramId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { telegramId }, select: { id: true } });
  if (!user) throw new AdminError("User not found", 404);
  return user.id;
}

// --- access ------------------------------------------------------------------------

const MANUAL_PLAN = "manual";

/** Admin-granted access: a subscription on the hidden zero-price "manual" plan, extending the current one. */
export async function grantAccess(userId: string, weeks: number) {
  if (!Number.isInteger(weeks) || weeks < 1 || weeks > 104) throw new AdminError("weeks must be 1–104", 400);
  const now = new Date();
  const [plan, current] = await Promise.all([
    prisma.plan.upsert({
      where: { code: MANUAL_PLAN },
      update: {},
      create: { code: MANUAL_PLAN, title: "Выдано вручную", priceStars: 0, periodWeeks: 1, isActive: false },
    }),
    prisma.subscription.findFirst({
      where: { userId, status: "active", endsAt: { gt: now } },
      orderBy: { endsAt: "desc" },
      select: { endsAt: true },
    }),
  ]);
  const startedAt = current?.endsAt ?? now;
  return prisma.subscription.create({
    data: { userId, planId: plan.id, startedAt, weeks, endsAt: new Date(startedAt.getTime() + weeks * 7 * DAY_MS) },
  });
}

export async function revokeAccess(userId: string) {
  const { count } = await prisma.subscription.updateMany({
    where: { userId, status: "active" },
    data: { status: "cancelled" },
  });
  return count;
}

// --- overview ----------------------------------------------------------------------

export async function getOverview(): Promise<AdminOverview> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * DAY_MS);
  const weekStart = weekStartOf(now);
  const [total, new7d, active7d, complete, blocked, round, lastRound, participants] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.user.count({ where: { lastSeenAt: { gte: weekAgo } } }),
    prisma.profile.count({ where: { isComplete: true } }),
    prisma.user.count({ where: { botBlockedAt: { not: null } } }),
    prisma.matchRound.findUnique({
      where: { weekStart },
      select: { matches: { where: { status: { not: "expired" } }, select: { status: true, user1AcceptedAt: true, user2AcceptedAt: true } } },
    }),
    prisma.matchRound.findFirst({ orderBy: { weekStart: "desc" }, select: { id: true, weekStart: true } }),
    prisma.user.count({ where: segmentWhere({ id: "participants" }, now) }),
  ]);
  const matches = round?.matches ?? [];
  return {
    users: { total, new7d, active7d, complete, blocked },
    week: {
      weekStart: formatDateOnly(weekStart),
      phase: getWeekPhase(now),
      pairs: matches.length,
      mutual: matches.filter((m) => m.user1AcceptedAt && m.user2AcceptedAt).length,
      met: matches.filter((m) => m.status === "met").length,
      participants,
    },
    lastRound: lastRound ? { roundId: lastRound.id, weekStart: formatDateOnly(lastRound.weekStart) } : null,
  };
}

// --- broadcast segments ------------------------------------------------------------

/** Users of a broadcast segment; banned / hidden users are never included. */
export function segmentWhere(segment: BroadcastSegment, now = new Date()): Prisma.UserWhereInput {
  const and: Prisma.UserWhereInput[] = [{ status: "active" }];
  switch (segment.id) {
    case "complete":
      and.push(where.complete());
      break;
    case "incomplete":
      and.push(where.incomplete());
      break;
    case "participants":
      // The next round's pool: complete, not paused, not skipping, with access.
      and.push(
        where.complete(),
        { OR: [{ settings: null }, { settings: { matchingOption: "active", skipNextRound: false } }] },
        { OR: [where.subscribed(now), { createdAt: { gt: trialStart(now) } }] }
      );
      break;
    case "this_week":
      and.push({
        OR: [
          { matchesAsUser1: { some: { round: { weekStart: weekStartOf(now) }, status: { not: "expired" } } } },
          { matchesAsUser2: { some: { round: { weekStart: weekStartOf(now) }, status: { not: "expired" } } } },
        ],
      });
      break;
    case "trial_ending":
      // Trial ends within the next 7 days.
      and.push(where.trial(now), { createdAt: { lte: new Date(trialStart(now).getTime() + 7 * DAY_MS) } });
      break;
    case "no_access":
      and.push(where.noAccess(now));
      break;
    case "subscribed":
      and.push(where.subscribed(now));
      break;
  }
  if (segment.country) and.push({ profile: { location: { country: segment.country } } });
  return { AND: and };
}
