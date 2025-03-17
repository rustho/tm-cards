// Common props interface for all step components
export interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

interface Location {
  country: string;
  region: string;
}

export type ProfileData = {
  name: string;
  age: string;
  occupation: string;
  personality: string[];
  interests: string[];
  hobbies: string[];
  travel: string;
  about: string;
  instagram: string;
  location: Location;
  request: string;
  photo: string | null;
};
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
