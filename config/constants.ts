export const ADMIN_TELEGRAM_IDS = [135052006, 648216801];

export const MENU_ITEMS = [
  {
    title: "Карточки с вопросами",
    href: "/questions",
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
  title: "Your Application Title Goes Here",
  description: "Your application description goes here",
} as const;
