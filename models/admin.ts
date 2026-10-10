/**
 * Shapes of the admin API (/api/admin/*), shared by the routes and the admin screens.
 * Dates are ISO strings.
 */

export type ProfileState = "none" | "draft" | "complete";

/** subscription = paid or granted by an admin; trial = first TRIAL_DAYS after sign-up. */
export type AccessKind = "subscription" | "trial" | "none";

export type UserStatus = "active" | "hidden" | "banned";
export const USER_STATUSES: UserStatus[] = ["active", "hidden", "banned"];

export const USER_FILTERS = ["all", "complete", "incomplete", "trial", "subscribed", "no_access", "blocked", "banned"] as const;
export type UserFilter = (typeof USER_FILTERS)[number];

export interface AdminUserRow {
  telegramId: string;
  name: string;
  username: string;
  photo: string;
  place: string;
  status: UserStatus;
  profile: ProfileState;
  access: { kind: AccessKind; endsAt: string | null };
  botBlocked: boolean;
  createdAt: string;
  lastSeenAt: string | null;
}

export interface AdminUserList {
  users: AdminUserRow[];
  total: number;
  offset: number;
  limit: number;
}

export interface AdminMatchRow {
  matchId: string;
  roundId: string;
  weekStart: string;
  status: string;
  score: number;
  createdAt: string;
  a: AdminPerson & { acceptedAt: string | null; feedback: AdminFeedback | null };
  b: AdminPerson & { acceptedAt: string | null; feedback: AdminFeedback | null };
}

export interface AdminPerson {
  telegramId: string;
  name: string;
  username: string;
}

export interface AdminFeedback {
  met: boolean;
  impressions: string[];
  reason: string | null;
  text: string | null;
  createdAt: string;
}

export interface AdminEvent {
  id: string;
  name: string;
  props: Record<string, unknown> | null;
  createdAt: string;
}

export interface AdminSubscription {
  id: string;
  plan: string;
  status: string;
  startedAt: string;
  endsAt: string;
}

export interface AdminUserDetails extends AdminUserRow {
  firstName: string;
  lastName: string;
  occupation: string;
  about: string;
  dateOfBirth: string;
  gender: string;
  interests: string[];
  values: string[];
  meetingFormats: string[];
  goals: string[];
  completedAt: string | null;
  trialEndsAt: string;
  participating: boolean;
  referrer: AdminPerson | null;
  referrals: number;
  subscriptions: AdminSubscription[];
  matches: AdminMatchRow[];
  events: AdminEvent[];
}

export type AdminUserAction =
  | { action: "setStatus"; status: UserStatus }
  | { action: "grantAccess"; weeks: number }
  | { action: "revokeAccess" };

export interface AdminOverview {
  users: { total: number; new7d: number; active7d: number; complete: number; blocked: number };
  week: { weekStart: string; phase: string; pairs: number; mutual: number; met: number; participants: number };
  lastRound: { roundId: string; weekStart: string } | null;
}

export interface MatchingConfigDto {
  maxMatchesPerRun: number;
  minCompatibilityScore: number;
  cooldownHours: number;
  enableNotifications: boolean;
  countriesWithoutRegions: string[];
}

export interface AdminRoundRow {
  roundId: string;
  weekStart: string;
  status: string;
  pairs: number;
  mutual: number;
  met: number;
  notMet: number;
}

export interface AdminMatchingState {
  config: MatchingConfigDto;
  isRunning: boolean;
  rounds: AdminRoundRow[];
}

export interface AdminRoundDetails extends AdminRoundRow {
  matches: AdminMatchRow[];
}

export interface MatchingPreviewDto {
  eligibleUsers: number;
  pairs: { a: PreviewPerson; b: PreviewPerson; score: number }[];
  unmatched: PreviewPerson[];
}

export interface PreviewPerson {
  telegramId: string;
  name: string;
  place: string;
}

export interface MatchingRunDto {
  success: boolean;
  roundWeekStart: string | null;
  matchesCreated: number;
  notificationsSent: number;
  eligibleUsers: number;
  unmatched: number;
  errors: string[];
}

export const BROADCAST_SEGMENTS = [
  "all",
  "complete",
  "incomplete",
  "participants",
  "this_week",
  "trial_ending",
  "no_access",
  "subscribed",
] as const;
export type BroadcastSegmentId = (typeof BROADCAST_SEGMENTS)[number];

export interface BroadcastSegment {
  id: BroadcastSegmentId;
  /** Optional: only profiles in this country. */
  country?: string;
}

export interface BroadcastAudience {
  /** Users in the segment. */
  total: number;
  /** Of them, not known to have blocked the bot. */
  reachable: number;
}

export type BroadcastStatus = "sending" | "done" | "cancelled";

export interface BroadcastDto {
  id: string;
  text: string;
  withAppButton: boolean;
  segment: BroadcastSegment;
  status: BroadcastStatus;
  createdBy: string;
  createdAt: string;
  finishedAt: string | null;
  total: number;
  counts: { pending: number; sent: number; blocked: number; failed: number };
}

export interface BroadcastFailure {
  telegramId: string;
  name: string;
  status: "blocked" | "failed";
  error: string | null;
}

export interface BroadcastDetails extends BroadcastDto {
  failures: BroadcastFailure[];
}

/** Telegram message limit; the {name} placeholder is replaced per recipient. */
export const MESSAGE_MAX_LENGTH = 4000;

// --- funnel ------------------------------------------------------------------------

export const FUNNEL_PERIODS = ["7", "30", "90", "365", "all"] as const;
export type FunnelPeriod = (typeof FUNNEL_PERIODS)[number];

export const FUNNEL_SOURCES = ["all", "referral", "organic"] as const;
export type FunnelSource = (typeof FUNNEL_SOURCES)[number];

/** Funnel steps in order; every count is "users of the cohort who ever reached it". */
export const FUNNEL_STEPS = ["users", "started", "completed", "matched", "accepted", "mutual", "met", "subscribed"] as const;
export type FunnelStep = (typeof FUNNEL_STEPS)[number];

/** Steps plus side metrics that are not a conversion stage (feedback: either verdict). */
export type FunnelCounts = Record<FunnelStep, number> & { feedback: number; referred: number; blocked: number };

/** Wizard step ids in order. Keep in sync with ONBOARDING_STEPS (app/profile/ui/wizardConfig.ts). */
export const ONBOARDING_STEP_IDS = [
  "location",
  "name",
  "dateOfBirth",
  "occupation",
  "values",
  "interests",
  "goal",
  "meetingFormat",
  "about",
  "photo",
  "theme",
  "firstMeeting",
] as const;

export interface FunnelDto {
  period: FunnelPeriod;
  source: FunnelSource;
  /** Cohort = users who signed up in [from, to); `from` null for all time. Test (mock_) users are left out. */
  from: string | null;
  to: string;
  totals: FunnelCounts;
  /** Sign-up weeks (Monday, UTC), newest first. */
  weeks: (FunnelCounts & { week: string })[];
  /** Median hours from sign-up to the finished questionnaire. */
  medianHoursToComplete: number | null;
  wizard: {
    /** First `onboarding_step` event ever: step data exists only from then on. */
    since: string | null;
    /** Cohort users who signed up after `since` (the base for step percentages). */
    users: number;
    steps: { step: string; users: number }[];
  };
}

// --- bot chat log --------------------------------------------------------------------

export interface BotMessageDto {
  id: string;
  direction: "in" | "out";
  source: "user" | "bot" | "notification" | "admin" | "broadcast";
  /** As sent: outgoing messages are Telegram HTML. */
  text: string;
  ok: boolean;
  error: string | null;
  sentBy: string | null;
  broadcastId: string | null;
  createdAt: string;
}

export interface BotDialogDto {
  /** Newest last. */
  messages: BotMessageDto[];
  /** Older messages exist: ask again with `before` = the first message's createdAt. */
  hasMore: boolean;
}
