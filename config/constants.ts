export const ADMIN_TELEGRAM_IDS = [135052006, 648216801, 307925776, 5193126268];

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
