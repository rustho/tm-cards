/**
 * Telegram user of the browser mock (core/mockEnv.ts, development only). Put it into
 * ADMIN_TELEGRAM_IDS in .env.local to see the admin menu locally.
 */
export const DEV_MOCK_TELEGRAM_ID = 135052006;

export const MENU_ITEMS = [
  {
    title: "Карточки с вопросами",
    href: "/icebreaker",
  },
  {
    title: "Создание анкеты",
    href: "/profile",
  },
  {
    title: "Домой",
    href: "/home",
  },
  {
    title: "Настройки",
    href: "/settings",
  },
] as const;

export const APP_METADATA = {
  title: "TravelMate",
  description: "Find your perfect travel companion",
} as const;

/** Free access after sign-up, before a subscription is needed. */
export const TRIAL_DAYS = 30;

/** Meetings shown in «История встреч» on the home tab; the rest live in the full log. */
export const HOME_HISTORY_LIMIT = 4;

/** Referral rewards shown on the «Приглашения» tab (billing is not wired yet). */
export const REFERRAL_BONUS_WEEKS = 2;
export const REFERRAL_FRIEND_DISCOUNT_PERCENT = 20;

/**
 * Timezone of the weekly cycle (matching runs on Monday).
 * `MEETINGS_PHASE=week|feedback|signup` in the environment overrides the schedule (testing).
 */
export const MEETINGS_TIMEZONE = "Asia/Bangkok";

/** A moment of the week in MEETINGS_TIMEZONE: day 1 = Monday … 7 = Sunday, hour 0–23. */
export type WeekTime = { day: number; hour: number };

/**
 * Weekly cycle (lib/weekCycle.ts), in order — expected to change, keep it here:
 * - Monday 00:00 → `agreeDeadline`: phase `week`, the pair presses «Хочу познакомиться»;
 * - `agreeDeadline` → `signupStart`: phase `feedback`, unagreed pairs become not_met
 *   and the «Встречи» tab asks for an impression of this week's meeting;
 * - `signupStart` → next Monday: phase `signup`, opt-in for the next round.
 */
export const WEEK_SCHEDULE: { agreeDeadline: WeekTime; signupStart: WeekTime } = {
  agreeDeadline: { day: 4, hour: 0 },
  signupStart: { day: 5, hour: 0 },
};

/** How far back the «Как прошло знакомство?» reminder looks for a meeting without my feedback. */
export const PENDING_FEEDBACK_DAYS = 14;

/** «Поделиться впечатлением» appears on the match screen this long after both said «Хочу познакомиться». */
export const FEEDBACK_OPENS_AFTER_HOURS = 24;
