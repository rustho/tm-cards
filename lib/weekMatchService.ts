import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getBotUsername, notifyUser } from "@/lib/bot";
import { weekStartOf } from "@/lib/matchingService";
import { OPEN_STATUSES, toPerson } from "@/lib/meetingsService";
import { FEEDBACK_OPENS_AFTER_HOURS } from "@/config/constants";
import { agreeDeadline } from "@/lib/weekCycle";
import { QUESTIONS, questionsCategoriesLabels } from "@/app/icebreaker/constants/questions";
import {
  INTEREST_GROUPS,
  MEETING_FORMAT_OPTIONS,
  VALUE_OPTIONS,
  type CurrentMatch,
  type MatchChip,
  type MeetingStatus,
  type WeeklyQuestion,
} from "@/models/types";

const HOUR_MS = 60 * 60 * 1000;

const sideSelect = {
  telegramId: true,
  username: true,
  firstName: true,
  lastName: true,
  profile: {
    select: {
      name: true,
      photo: true,
      location: { select: { country: true, region: true } },
      tags: { select: { tag: { select: { category: true, label: true } } } },
    },
  },
} satisfies Prisma.UserSelect;

const weekMatchInclude = {
  round: true,
  user1: { select: sideSelect },
  user2: { select: sideSelect },
  feedback: { select: { authorId: true } },
} satisfies Prisma.MatchInclude;

type WeekMatchRow = Prisma.MatchGetPayload<{ include: typeof weekMatchInclude }>;
type SideRow = WeekMatchRow["user1"];

const OPTIONS: readonly { label: string; emoji: string }[] = [
  ...INTEREST_GROUPS.flatMap((g): readonly { label: string; emoji: string }[] => g.options),
  ...VALUE_OPTIONS,
  ...MEETING_FORMAT_OPTIONS,
];
const EMOJI = new Map(OPTIONS.map((o) => [o.label, o.emoji]));
const chip = (label: string): MatchChip => ({ label, emoji: EMOJI.get(label) ?? "✨" });

const tagsOf = (side: SideRow, categories: string[]) =>
  side.profile?.tags.filter((t) => categories.includes(t.tag.category)).map((t) => t.tag.label) ?? [];

/** Sides of a match from the viewer's point of view. */
function sides(match: WeekMatchRow, viewerId: string) {
  const viewerIsUser1 = match.user1Id === viewerId;
  return {
    me: viewerIsUser1 ? match.user1 : match.user2,
    partner: viewerIsUser1 ? match.user2 : match.user1,
    myAcceptedAt: viewerIsUser1 ? match.user1AcceptedAt : match.user2AcceptedAt,
    partnerAcceptedAt: viewerIsUser1 ? match.user2AcceptedAt : match.user1AcceptedAt,
  };
}

const isMutual = (match: WeekMatchRow) => Boolean(match.user1AcceptedAt && match.user2AcceptedAt);

/** t.me link to the partner, or the bot chat (where the contact was sent) when they have no @username. */
async function contactUrl(partner: SideRow): Promise<string | null> {
  if (partner.username) return `https://t.me/${partner.username}`;
  const bot = await getBotUsername();
  return bot ? `https://t.me/${bot}` : null;
}

async function toCurrentMatch(match: WeekMatchRow, viewerId: string): Promise<CurrentMatch> {
  const { me, partner, myAcceptedAt, partnerAcceptedAt } = sides(match, viewerId);
  const mutual = isMutual(match);
  const mutualAt = mutual
    ? new Date(Math.max(match.user1AcceptedAt!.getTime(), match.user2AcceptedAt!.getTime()))
    : null;

  const myVibes = new Set(tagsOf(me, ["interest", "value"]));
  const myFormats = new Set(tagsOf(me, ["format"]));
  const location = partner.profile?.location;

  return {
    matchId: match.id,
    partner: {
      ...toPerson(partner),
      location: location ? [location.country, location.region].filter(Boolean).join(", ") : "",
    },
    me: toPerson(me),
    status: match.status as MeetingStatus,
    vibes: tagsOf(partner, ["interest", "value"]).filter((l) => myVibes.has(l)).map(chip),
    formats: tagsOf(partner, ["format"]).map((l) => ({ ...chip(l), common: myFormats.has(l) })),
    deadline: agreeDeadline(match.round.weekStart).toISOString(),
    iAccepted: Boolean(myAcceptedAt),
    partnerAccepted: Boolean(partnerAcceptedAt),
    contactUrl: mutual ? await contactUrl(partner) : null,
    canShareFeedback:
      mutualAt !== null &&
      Date.now() - mutualAt.getTime() >= FEEDBACK_OPENS_AFTER_HOURS * HOUR_MS &&
      OPEN_STATUSES.includes(match.status as MeetingStatus) &&
      !match.feedback.some((f) => f.authorId === viewerId),
  };
}

/** The viewer's pair from this week's round (expired ones excluded), or null. */
export async function getCurrentMatch(userId: string): Promise<CurrentMatch | null> {
  const match = await prisma.match.findFirst({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
      status: { not: "expired" },
      round: { weekStart: weekStartOf(new Date()) },
    },
    include: weekMatchInclude,
    orderBy: { createdAt: "desc" },
  });
  return match ? toCurrentMatch(match, userId) : null;
}

export class WeekMatchError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function loadForParticipant(matchId: string, userId: string): Promise<WeekMatchRow> {
  const match = await prisma.match.findUnique({ where: { id: matchId }, include: weekMatchInclude });
  if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
    throw new WeekMatchError("Meeting not found", 404);
  }
  return match;
}

/** Display name with a link: @username if there is one, else a tg://user mention. */
function contactHtml(user: SideRow): string {
  const name = toPerson(user).name.replace(/[<>&]/g, "");
  return user.username
    ? `<a href="https://t.me/${user.username}">${name}</a>`
    : `<a href="tg://user?id=${user.telegramId}">${name}</a>`;
}

/**
 * «Хочу познакомиться». Idempotent. The first click nudges the partner; the second one
 * makes the pair mutual and sends both a direct contact through the bot.
 */
export async function acceptMatch(matchId: string, userId: string): Promise<CurrentMatch> {
  const match = await loadForParticipant(matchId, userId);
  if (match.status !== "pending") throw new WeekMatchError("Meeting is closed", 409);
  if (Date.now() > agreeDeadline(match.round.weekStart).getTime()) {
    throw new WeekMatchError("Time to agree is over", 409);
  }

  const field = match.user1Id === userId ? "user1AcceptedAt" : "user2AcceptedAt";
  if (match[field]) return toCurrentMatch(match, userId);

  const updated = await prisma.match.update({
    where: { id: matchId },
    data: { [field]: new Date() },
    include: weekMatchInclude,
  });

  const { me, partner } = sides(updated, userId);
  if (isMutual(updated)) {
    console.log(`🤝 Match ${matchId} is mutual`);
    void notifyUser(me.telegramId, `🎉 Вы оба хотите познакомиться! Напиши ${contactHtml(partner)} и договоритесь о встрече.`);
    void notifyUser(partner.telegramId, `🎉 ${contactHtml(me)} тоже хочет познакомиться! Напиши и договоритесь о встрече.`);
  } else {
    void notifyUser(partner.telegramId, `👋 ${toPerson(me).name} хочет с тобой познакомиться. Загляни во «Встречи»!`);
  }
  return toCurrentMatch(updated, userId);
}

/** Same question for both sides (picked by match id); romance questions are left out for strangers. */
export async function getWeeklyQuestion(matchId: string, userId: string): Promise<WeeklyQuestion> {
  const match = await loadForParticipant(matchId, userId);
  if (!isMutual(match)) throw new WeekMatchError("Question opens when both accept", 403);

  const pool = QUESTIONS.filter((q) => q.type !== "loveAndRomance");
  const hash = Array.from(match.id).reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const question = pool[hash % pool.length];
  return { text: question.text, category: questionsCategoriesLabels[question.type] };
}
