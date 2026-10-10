// Common props interface for all step components
export interface StepProps {
  /** Resolves when the step is handled; `false` means the final save failed and the step stays on screen. */
  onNext: () => void | Promise<boolean | void>;
}

// Constants
/** Life values (wizard step 5): pick 1–3. Stored as tags of category "value". */
export const VALUE_OPTIONS = [
  { label: "Свобода", emoji: "🕊️" },
  { label: "Семья", emoji: "🏡" },
  { label: "Профессиональная реализация", emoji: "🎯" },
  { label: "Творчество и самовыражение", emoji: "🎨" },
  { label: "Новый опыт", emoji: "🧭" },
  { label: "Баланс в жизни", emoji: "⚖️" },
  { label: "Помогать другим", emoji: "🤝" },
  { label: "Говорить прямо", emoji: "💬" },
  { label: "Создавать новое", emoji: "💡" },
  { label: "Свои люди", emoji: "👥" },
  { label: "Познание себя", emoji: "🪞" },
] as const;

export const VALUES = VALUE_OPTIONS.map((v) => v.label);
export const MAX_VALUES = 3;

/** Meeting formats (wizard step 8): pick 1–4. Stored as tags of category "format". */
export const MEETING_FORMAT_OPTIONS = [
  { label: "Выпить кофе", emoji: "☕" },
  { label: "Вкусно поесть вместе", emoji: "🍽️" },
  { label: "Посетить выставку, музей или кинопоказ", emoji: "🎭" },
  { label: "Поработать или поучиться вместе", emoji: "💻" },
  { label: "Погулять и исследовать город", emoji: "🚶" },
  { label: "Вместе заняться спортом", emoji: "🏸" },
  { label: "Выбраться на природу", emoji: "🌿" },
  { label: "Отправиться в небольшое путешествие", emoji: "🚗" },
  { label: "Поиграть в настолки или сходить на квиз", emoji: "🎲" },
] as const;

export const MEETING_FORMATS = MEETING_FORMAT_OPTIONS.map((f) => f.label);
export const MAX_MEETING_FORMATS = 4;

/**
 * Profile card designs ("themes"), picked at the end of onboarding and stored
 * in `profiles.theme`. Each id has a template in components/profile-templates.
 */
export const PROFILE_THEMES = ["yoga", "sky", "music", "art", "retro", "notebook"] as const;
export type ProfileTheme = (typeof PROFILE_THEMES)[number];
export const DEFAULT_PROFILE_THEME: ProfileTheme = "notebook";

/**
 * Interests and hobbies (wizard step 6), grouped for display only: every
 * option is stored as a tag of category "interest". Pick MIN_INTERESTS–MAX_INTERESTS.
 */
export const INTEREST_GROUPS = [
  {
    title: "Творчество и культура",
    options: [
      { label: "Фотография", emoji: "📷" },
      { label: "Кино и сериалы", emoji: "🎬" },
      { label: "Литература", emoji: "📚" },
      { label: "Музыка", emoji: "🎵" },
      { label: "Театр", emoji: "🎭" },
      { label: "Изобразительное искусство", emoji: "🎨" },
      { label: "Архитектура", emoji: "🏛️" },
      { label: "Керамика и ручная работа", emoji: "🏺" },
      { label: "Писательство", emoji: "✍️" },
      { label: "Аниме", emoji: "⛩️" },
      { label: "Мода и стиль", emoji: "👗" },
      { label: "Подкасты", emoji: "🎙️" },
    ],
  },
  {
    title: "Идеи и общество",
    options: [
      { label: "Психология", emoji: "🧠" },
      { label: "Философия", emoji: "💭" },
      { label: "История", emoji: "📜" },
      { label: "Наука", emoji: "🔬" },
      { label: "Образование", emoji: "🎓" },
      { label: "Иностранные языки", emoji: "🌐" },
      { label: "Политика и общество", emoji: "🗳️" },
      { label: "Феминизм и гендер", emoji: "⚖️" },
      { label: "Религия", emoji: "🕊️" },
      { label: "Духовные практики", emoji: "🧘" },
    ],
  },
  {
    title: "Спорт и движение",
    options: [
      { label: "Бег", emoji: "🏃" },
      { label: "Йога", emoji: "🤸" },
      { label: "Фитнес", emoji: "💪" },
      { label: "Плавание", emoji: "🏊" },
      { label: "Сёрфинг", emoji: "🏄" },
      { label: "Дайвинг", emoji: "🤿" },
      { label: "Велоспорт", emoji: "🚴" },
      { label: "Хайкинг", emoji: "🥾" },
      { label: "Скалолазание", emoji: "🧗" },
      { label: "Танцы", emoji: "💃" },
    ],
  },
  {
    title: "Путешествия и природа",
    options: [
      { label: "Путешествия", emoji: "✈️" },
      { label: "Кемпинг", emoji: "🏕️" },
      { label: "Природа", emoji: "🌿" },
      { label: "Животные", emoji: "🐾" },
      { label: "Садоводство", emoji: "🌱" },
      { label: "Экология", emoji: "🌍" },
    ],
  },
  {
    title: "Еда и напитки",
    options: [
      { label: "Кулинария", emoji: "🍳" },
      { label: "Кофе", emoji: "☕" },
      { label: "Вино", emoji: "🍷" },
      { label: "Стритфуд", emoji: "🍜" },
      { label: "Здоровое питание", emoji: "🥗" },
    ],
  },
  {
    title: "Технологии и бизнес",
    options: [
      { label: "Технологии", emoji: "💻" },
      { label: "Искусственный интеллект", emoji: "🤖" },
      { label: "Стартапы", emoji: "🚀" },
      { label: "Инвестиции", emoji: "📈" },
      { label: "Маркетинг", emoji: "📣" },
    ],
  },
  {
    title: "Игры и досуг",
    options: [
      { label: "Видеоигры", emoji: "🎮" },
      { label: "Настольные игры", emoji: "🎲" },
      { label: "Шахматы", emoji: "♟️" },
      { label: "Караоке", emoji: "🎤" },
      { label: "Вечеринки", emoji: "🎉" },
    ],
  },
] as const;

export const INTERESTS = INTEREST_GROUPS.flatMap((g) => g.options.map((o) => o.label));
export const MIN_INTERESTS = 3;
export const MAX_INTERESTS = 10;

/**
 * Meeting goals (wizard step 7): pick 1–MAX_GOALS. Stored as ids in
 * `profiles.goals`; titles and descriptions live in profile.steps.goal.options.
 * Private: used for matching, never shown on the profile.
 */
export const GOAL_OPTIONS = [
  { id: "close", emoji: "💙" },
  { id: "casual", emoji: "💬" },
  { id: "romance", emoji: "💘" },
  { id: "hobbies", emoji: "🎸" },
  { id: "adventures", emoji: "🌍" },
] as const;

export type GoalId = (typeof GOAL_OPTIONS)[number]["id"];
export const GOAL_IDS: readonly string[] = GOAL_OPTIONS.map((g) => g.id);
export const MAX_GOALS = 2;

/**
 * Onboarding locations. Each option is one `locations` row (country + region;
 * region may be empty for a whole destination like Bali). `available: false`
 * options are shown locked under "Появятся позже".
 */
export interface LocationOption {
  country: string;
  region: string;
  label: string;
  flag: string;
  available: boolean;
}

export const LOCATIONS: readonly LocationOption[] = [
  { country: "Сербия", region: "Белград", label: "Белград", flag: "🇷🇸", available: true },
  { country: "Грузия", region: "Тбилиси", label: "Тбилиси", flag: "🇬🇪", available: true },
  { country: "Бали", region: "", label: "Бали", flag: "🇮🇩", available: true },
  { country: "Таиланд", region: "", label: "Таиланд", flag: "🇹🇭", available: false },
  { country: "Вьетнам", region: "", label: "Вьетнам", flag: "🇻🇳", available: false },
  { country: "ОАЭ", region: "Дубай", label: "Дубай", flag: "🇦🇪", available: false },
];

export interface User {
  id: string;
  username: string;
  name: string;
  goals: string[];
  gender: string;
  country: string;
  region: string;
  interests: string[];
  values: string[];
  meetingFormats: string[];
  similarInterests: string;
  announcement: string;
  profile: string; // "About"
  placesToVisit: string;
  instagram: string;
  skip: number;
  previousMatch: any[];
  nextMatch: string;
}

interface Location {
  country: string;
  region: string;
}

// Updated Profile to include necessary fields for the wizard
export type Profile = Omit<
  User,
  "gender" | "nextMatch" | "previousMatch" | "skip"
> & {
  photo: string;
  dateOfBirth: string;
  occupation: string;
  theme: string;
  /** Write-only (onboarding "first meeting" screen): true skips the upcoming
   * matching round. Stored in user_settings, never returned by the API. */
  skipNextRound?: boolean;
  /** Own profile only (`GET /api/profile`): the wizard was finished. */
  isComplete?: boolean;
};

// Kept for backward compatibility if used elsewhere, but aligned with Profile
export type ProfileData = Profile & {
  about: string; // Alias for profile
};

// Settings Types
/**
 * Weekly-meetings participation as the «Профиль» menu sees it. `active` with `skipNextRound` means
 * «Пропускаю неделю» was pressed on /meetings. `pause_month` / `pause_indefinite` are legacy values
 * still stored for some users; new writes only use `active`, `pause_week` and `pause_custom`.
 */
export type ParticipationOption = "active" | "pause_week" | "pause_month" | "pause_custom" | "pause_indefinite";
export type ParticipationChoice = Extract<ParticipationOption, "active" | "pause_week" | "pause_custom">;

export interface Participation {
  option: ParticipationOption;
  /** ISO; when matching picks the user up again (null for `active` and an indefinite pause). */
  resumeDate: string | null;
  skipNextRound: boolean;
}

/** GET /api/settings — everything the «Профиль» menu shows besides the profile itself. */
export interface AccountSettings {
  access: { hasAccess: boolean; subscribed: boolean; accessEndsAt: string | null };
  participation: Participation;
  /** «Уведомления от бота» (`user_settings.notifyNewMatches`), honoured by notifyUser(). */
  notifications: boolean;
}

/** Match status as the meetings UI sees it (`expired` matches are never sent). */
export type MeetingStatus = "pending" | "met" | "not_met" | "postponed";

/** What the row button does: leave my impression, read the partner's, or nothing. */
export type MeetingAction = "share" | "view" | null;

/** «Поделись своим состоянием после встречи» chips (multi-select). Labels: `meetings.impressions.<id>`. */
export const IMPRESSION_OPTIONS = [
  { id: "easy", emoji: "✨" },
  { id: "meet_again", emoji: "🫶" },
  { id: "learned_self", emoji: "🌱" },
  { id: "vibes_mismatch", emoji: "🎭" },
  { id: "different_interesting", emoji: "🧩" },
  { id: "new_thoughts", emoji: "🧠" },
  { id: "deeper", emoji: "🌙" },
  { id: "alike", emoji: "🤝" },
  { id: "mixed", emoji: "💭" },
  { id: "different_worlds", emoji: "🪐" },
] as const;
export type ImpressionId = (typeof IMPRESSION_OPTIONS)[number]["id"];

/** «Что-то пошло не так?» (single choice). Labels: `meetings.reasons.<id>`. */
export const NOT_MET_REASONS = [
  { id: "no_reply", emoji: "💬" },
  { id: "different_locations", emoji: "📍" },
  { id: "too_busy", emoji: "💼" },
  { id: "no_time_to_chat", emoji: "⏰" },
  { id: "interests", emoji: "👥" },
  { id: "plans_changed", emoji: "📅" },
  { id: "app_issues", emoji: "⚙️" },
  { id: "other", emoji: "✏️" },
  { id: "report", emoji: "❌" },
] as const;
export type NotMetReason = (typeof NOT_MET_REASONS)[number]["id"];

/** Free-text limit of an impression. */
export const FEEDBACK_TEXT_MAX = 250;

/** What the partner sees: only «met» feedback is ever shared, reasons stay private. */
export interface MeetingImpression {
  impressions: ImpressionId[];
  text: string;
}

/** The viewer's own verdict. */
export interface MyMeetingFeedback {
  met: boolean;
  impressions: ImpressionId[];
  reason: NotMetReason | null;
  text: string;
}

/** One match from the viewer's side (`/api/home`, `/api/meetings`). */
export interface Meeting {
  matchId: string;
  partner: { id: string; name: string; photo: string };
  status: MeetingStatus;
  matchedAt: string;
  action: MeetingAction;
}

/** `GET /api/meetings/[matchId]`: the meeting, both sides and both impressions. */
export interface MeetingDetails extends Meeting {
  partner: Meeting["partner"] & { occupation: string; location: string };
  me: { id: string; name: string; photo: string };
  myFeedback: MyMeetingFeedback | null;
  partnerFeedback: MeetingImpression | null;
}

export interface PersonPreview {
  id: string;
  name: string;
  photo: string;
}

/** `GET /api/home`: everything the «Люди» tab shows. */
export interface HomeSummary {
  /** Active subscription or the free trial month. */
  hasAccess: boolean;
  /** When access ends (subscription end or trial end), ISO; null when there is none. */
  accessEndsAt: string | null;
  /** Latest HOME_HISTORY_LIMIT meetings, newest first. */
  history: Meeting[];
  /** Meetings that took place (`met`) and a few of those partners. */
  meetings: { count: number; people: PersonPreview[] };
  /** Users who joined through my referral link. */
  invited: { count: number; people: PersonPreview[] };
  /** Meetings waiting for my impression; drives the hint banner. */
  awaitingFeedback: number;
}

/** `GET /api/invitations`: the «Приглашения» tab. */
export interface InvitationsSummary {
  /** Paid subscription: only then can the user invite (the trial does not count). */
  canInvite: boolean;
  /** `t.me/…?startapp=ref_<code>`; null without a subscription or when the bot is not configured. */
  inviteLink: string | null;
  invited: (PersonPreview & { occupation: string })[];
}

/** Part of the weekly cycle (WEEK_SCHEDULE): the pair meets → leaves impressions → people opt in for next week. */
export type WeekPhase = "week" | "feedback" | "signup";

/** `GET /api/meetings/current`: the «Встречи» tab. */
export interface MeetingsWeek {
  /** Subscription or trial; without it the tab only leads to «Выбрать подписку». */
  hasAccess: boolean;
  phase: WeekPhase;
  /** Not paused in settings and not skipping the next round. */
  participating: boolean;
  location: { country: string; region: string } | null;
  /** This round's pair during the `week` and `feedback` phases; null when there is none. */
  match: CurrentMatch | null;
}

/** `GET /api/meetings/pending-feedback`: a recent meeting still waiting for my impression. */
export interface PendingFeedback {
  matchId: string;
  partner: PersonPreview;
}

/** A chip on the match screen: tag label plus its emoji from the option lists. */
export interface MatchChip {
  label: string;
  emoji: string;
}

/** This round's pair as the «Встречи» tab shows it (`week` / `feedback` phases). */
export interface CurrentMatch {
  matchId: string;
  partner: PersonPreview & { location: string };
  me: PersonPreview;
  /** Interests and values both profiles share. */
  vibes: MatchChip[];
  /** The partner's meeting formats; `common` when I picked it too. */
  formats: (MatchChip & { common: boolean })[];
  status: MeetingStatus;
  /** Time to agree on the meeting (WEEK_SCHEDULE.agreeDeadline), ISO. */
  deadline: string;
  iAccepted: boolean;
  partnerAccepted: boolean;
  /** Where «Написать» leads once both accepted: the partner's t.me link, or the bot chat with the contact. */
  contactUrl: string | null;
  /** Both accepted at least FEEDBACK_OPENS_AFTER_HOURS ago and my impression is still missing. */
  canShareFeedback: boolean;
}

/** `GET /api/meetings/[matchId]/question`: the pair's question of the week (opens once both accepted). */
export interface WeeklyQuestion {
  text: string;
  category: string;
}
