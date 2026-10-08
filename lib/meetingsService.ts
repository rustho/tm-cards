import type { Prisma, User } from "@prisma/client";
import prisma from "@/lib/prisma";
import { notifyUser } from "@/lib/bot";
import { TRIAL_DAYS } from "@/config/constants";
import {
  IMPRESSION_OPTIONS,
  NOT_MET_REASONS,
  type ImpressionId,
  type Meeting,
  type MeetingAction,
  type MeetingDetails,
  type MeetingStatus,
  type NotMetReason,
  type PersonPreview,
} from "@/models/types";

const DAY_MS = 24 * 60 * 60 * 1000;

export const personSelect = {
  telegramId: true,
  firstName: true,
  lastName: true,
  profile: { select: { name: true, photo: true } },
} satisfies Prisma.UserSelect;

/** Person plus what the meeting header shows (occupation, «Город, Страна»). */
const partnerSelect = {
  ...personSelect,
  profile: {
    select: { name: true, photo: true, occupation: true, location: { select: { country: true, region: true } } },
  },
} satisfies Prisma.UserSelect;

type PersonRow = Prisma.UserGetPayload<{ select: typeof personSelect }>;

export const meetingInclude = {
  user1: { select: partnerSelect },
  user2: { select: partnerSelect },
  feedback: true,
} satisfies Prisma.MatchInclude;

type MatchRow = Prisma.MatchGetPayload<{ include: typeof meetingInclude }>;

/** Matches the meetings UI lists for a user: everything except expired ones. */
export const visibleMatchesWhere = (userId: string): Prisma.MatchWhereInput => ({
  OR: [{ user1Id: userId }, { user2Id: userId }],
  status: { not: "expired" },
});

/** Statuses in which the viewer can still leave an impression. */
export const OPEN_STATUSES: MeetingStatus[] = ["pending", "met", "postponed"];

export function toPerson(user: PersonRow): PersonPreview {
  return {
    id: user.telegramId,
    name: user.profile?.name || [user.firstName, user.lastName].filter(Boolean).join(" "),
    photo: user.profile?.photo ?? "",
  };
}

const IMPRESSION_IDS = new Set<string>(IMPRESSION_OPTIONS.map((o) => o.id));
const REASON_IDS = new Set<string>(NOT_MET_REASONS.map((o) => o.id));

const knownImpressions = (ids: string[]) => ids.filter((id): id is ImpressionId => IMPRESSION_IDS.has(id));

/**
 * Row button:
 * - `view` as soon as the partner shared a «met» impression (I may answer from there);
 * - `share` while the meeting is open and I have not left feedback;
 * - nothing otherwise (not_met, or mine sent and theirs still missing).
 */
function actionFor(status: MeetingStatus, mine: boolean, partnerShared: boolean): MeetingAction {
  if (partnerShared) return "view";
  if (!mine && OPEN_STATUSES.includes(status)) return "share";
  return null;
}

export function toMeetingDetails(match: MatchRow, viewerId: string): MeetingDetails {
  const [me, partner] = match.user1Id === viewerId ? [match.user1, match.user2] : [match.user2, match.user1];
  const mine = match.feedback.find((f) => f.authorId === viewerId);
  // Only «met» feedback is shared; not-met reasons (and reports) stay private.
  const theirs = match.feedback.find((f) => f.authorId !== viewerId && f.met);
  const status = match.status as MeetingStatus;
  const location = partner.profile?.location;

  return {
    matchId: match.id,
    partner: {
      ...toPerson(partner),
      occupation: partner.profile?.occupation ?? "",
      location: location ? [location.region, location.country].filter(Boolean).join(", ") : "",
    },
    me: toPerson(me),
    status,
    matchedAt: match.createdAt.toISOString(),
    action: actionFor(status, Boolean(mine), Boolean(theirs)),
    myFeedback: mine
      ? {
          met: mine.met,
          impressions: knownImpressions(mine.impressions),
          reason: REASON_IDS.has(mine.reason ?? "") ? (mine.reason as NotMetReason) : null,
          text: mine.text ?? "",
        }
      : null,
    partnerFeedback: theirs ? { impressions: knownImpressions(theirs.impressions), text: theirs.text ?? "" } : null,
  };
}

export function toMeeting(match: MatchRow, viewerId: string): Meeting {
  const { matchId, partner, status, matchedAt, action } = toMeetingDetails(match, viewerId);
  return { matchId, partner: { id: partner.id, name: partner.name, photo: partner.photo }, status, matchedAt, action };
}

/**
 * Access = an active subscription, or the trial month counted from sign-up.
 * `subscribed` is true only for a paid subscription (the trial does not unlock invitations).
 */
export async function getAccess(
  user: User
): Promise<{ hasAccess: boolean; subscribed: boolean; accessEndsAt: Date | null }> {
  const now = new Date();
  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id, status: "active", endsAt: { gt: now } },
    orderBy: { endsAt: "desc" },
  });
  if (subscription) return { hasAccess: true, subscribed: true, accessEndsAt: subscription.endsAt };

  const trialEndsAt = new Date(user.createdAt.getTime() + TRIAL_DAYS * DAY_MS);
  return { hasAccess: trialEndsAt > now, subscribed: false, accessEndsAt: trialEndsAt };
}

export type FeedbackInput =
  | { outcome: "met"; impressions: ImpressionId[]; text: string }
  | { outcome: "not_met"; reason: NotMetReason; text: string }
  | { outcome: "later" };

/** Validates the POST body; null when it does not describe a valid verdict. */
export function parseFeedbackInput(body: unknown, maxText: number): FeedbackInput | null {
  if (!body || typeof body !== "object") return null;
  const { outcome, impressions, reason, text } = body as Record<string, unknown>;
  const cleanText = typeof text === "string" ? text.trim().slice(0, maxText) : "";

  if (outcome === "later") return { outcome };
  if (outcome === "not_met") {
    return typeof reason === "string" && REASON_IDS.has(reason)
      ? { outcome, reason: reason as NotMetReason, text: cleanText }
      : null;
  }
  if (outcome === "met") {
    if (!Array.isArray(impressions)) return null;
    const ids = Array.from(new Set(knownImpressions(impressions.filter((i): i is string => typeof i === "string"))));
    return ids.length > 0 ? { outcome, impressions: ids, text: cleanText } : null;
  }
  return null;
}

export class FeedbackError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

/**
 * Records the viewer's verdict and moves the match status:
 * met wins over everything; not_met applies unless someone already said met;
 * later (no feedback row) marks a pending match postponed — it stays open until someone answers.
 * A «met» impression notifies the partner through the bot.
 */
export async function submitFeedback(matchId: string, viewerId: string, input: FeedbackInput): Promise<MatchRow> {
  const match = await prisma.match.findUnique({ where: { id: matchId }, include: meetingInclude });
  if (!match || (match.user1Id !== viewerId && match.user2Id !== viewerId)) {
    throw new FeedbackError("Meeting not found", 404);
  }
  if (!OPEN_STATUSES.includes(match.status as MeetingStatus)) {
    throw new FeedbackError("Meeting is closed", 409);
  }
  if (match.feedback.some((f) => f.authorId === viewerId)) {
    throw new FeedbackError("Feedback already left", 409);
  }

  if (input.outcome === "later") {
    if (match.status !== "pending") throw new FeedbackError("Meeting cannot be postponed", 409);
    return prisma.match.update({ where: { id: matchId }, data: { status: "postponed" }, include: meetingInclude });
  }

  const met = input.outcome === "met";
  const status = met || match.status === "met" ? "met" : "not_met";
  const [, updated] = await prisma.$transaction([
    prisma.matchFeedback.create({
      data: {
        matchId,
        authorId: viewerId,
        met,
        impressions: met ? input.impressions : [],
        reason: met ? null : input.reason,
        text: input.text || null,
      },
    }),
    prisma.match.update({ where: { id: matchId }, data: { status }, include: meetingInclude }),
  ]);

  const [me, partner] = updated.user1Id === viewerId ? [updated.user1, updated.user2] : [updated.user2, updated.user1];
  if (met) {
    void notifyUser(partner.telegramId, `💌 ${toPerson(me).name} поделился(ась) впечатлением о вашей встрече. Загляни в TravelMate!`);
  } else if (input.reason === "report") {
    console.log(`🚩 Report on user ${partner.telegramId} from ${me.telegramId} (match ${matchId})`);
  }
  return updated;
}
