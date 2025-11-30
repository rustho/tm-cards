// Common props interface for all step components
export interface StepProps {
  onNext: () => void;
}

// Constants
export const PERSONALITY_TRAITS = [
  "Креативный",
  "Амбициозный",
  "Добрый",
  "Открытый",
  "Спокойный",
  "Энергичный",
  "Умный",
  "Весёлый",
  "Серьёзный",
  "Оптимистичный",
  "Скромный",
  "Уверенный",
  "Творческий",
  "Ответственный",
  "Дружелюбный",
  "Смелый",
  "Терпеливый",
  "Честный",
  "Внимательный",
  "Спонтанный",
] as const;

export const INTERESTS = [
  "Путешествия",
  "Искусство",
  "Музыка",
  "Спорт",
  "Кулинария",
  "Технологии",
  "Кино",
  "Литература",
  "Фотография",
  "Природа",
  "История",
  "Наука",
  "Мода",
  "Дизайн",
  "Бизнес",
  "Психология",
  "Философия",
  "Языки",
  "Танцы",
  "Театр",
] as const;

export const HOBBIES = [
  "Плавание",
  "Бег",
  "Йога",
  "Велоспорт",
  "Танцы",
  "Рисование",
  "Фотография",
  "Кулинария",
  "Садоводство",
  "Музыка",
  "Чтение",
  "Путешествия",
  "Спорт",
  "Игра на инструментах",
  "Рукоделие",
  "Шахматы",
  "Коллекционирование",
  "Писательство",
  "Медитация",
  "Пешие прогулки",
] as const;

export const GOALS = [
    "Найти друзей",
    "Найти партнера",
    "Нетворкинг",
    "Общение",
    "Путешествия вместе",
] as const;

export const LOCATIONS: Array<{
  country: string;
  regions: Array<string>;
}> = [
  {
    country: "Вьетнам",
    regions: ["Да Нанг", "Ня Чанг"],
  },
  {
    country: "Бали",
    regions: ["Чангу", "Убуд", "Букит"],
  },
  {
    country: "Таиланд",
    regions: ["Бангкок", "Пхукет", "Паттайя", "Чангмай"],
  },
  {
    country: "Шри-Ланка",
    regions: ["Коломбо", "Канди"],
  },
];

export type PersonalityTrait = (typeof PERSONALITY_TRAITS)[number];
export type Interest = (typeof INTERESTS)[number];
export type Hobby = (typeof HOBBIES)[number];
export type Goal = (typeof GOALS)[number];

export interface User {
  id: string;
  username: string;
  name: string;
  goal: string;
  gender: string;
  country: string;
  region: string;
  interests: string[];
  hobbies: string[];
  personalityTraits: string[];
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
};

// Kept for backward compatibility if used elsewhere, but aligned with Profile
export type ProfileData = Profile & {
  about: string; // Alias for profile
  occupation: string;
};

// Settings Types
export interface NotificationSettings {
  newMatches: boolean;
  messages: boolean;
  profileViews: boolean;
  gameInvites: boolean;
  weeklyDigest: boolean;
}

export interface MatchingScheduleSettings {
  option:
    | "active"
    | "pause_week"
    | "pause_month"
    | "pause_custom"
    | "pause_indefinite";
  customDate?: string | null;
  resumeDate?: string | null;
  lastUpdated: string;
}

export interface UserSettings {
  userId: string;
  notifications: NotificationSettings;
  matchingSchedule: MatchingScheduleSettings;
}
