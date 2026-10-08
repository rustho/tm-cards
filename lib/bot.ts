import { Bot, InlineKeyboard } from "grammy";

/**
 * grammY bot. Runs in webhook mode only (app/api/bot/webhook); never call
 * bot.start() here — long polling does not fit serverless hosting.
 */

export const BOT_COMMANDS = [
  { command: "start", description: "Начать и открыть TravelMate" },
  { command: "app", description: "Открыть мини-приложение" },
  { command: "help", description: "Как пользоваться ботом" },
];

const TEXTS = {
  start:
    "🌍 Привет! Я бот TravelMate.\n\n" +
    "Здесь ты найдёшь попутчиков и единомышленников в Юго-Восточной Азии. " +
    "Заполни анкету в приложении, а я пришлю уведомление, когда появится совпадение.",
  help:
    "Команды:\n" +
    "/app — открыть TravelMate\n" +
    "/help — эта подсказка\n\n" +
    "Все основные действия выполняются в мини-приложении.",
  fallback: "Я понимаю только команды. Нажми /app, чтобы открыть TravelMate.",
  openApp: "🚀 Открыть TravelMate",
};

let instance: Bot | undefined;

export function getMiniAppUrl(): string | undefined {
  return process.env.MINI_APP_URL || process.env.APP_URL || undefined;
}

function openAppKeyboard(): InlineKeyboard | undefined {
  const url = getMiniAppUrl();
  if (!url || !url.startsWith("https://")) return undefined;
  return new InlineKeyboard().webApp(TEXTS.openApp, url);
}

let botUsername: string | undefined;

/** The bot's @username (cached), or undefined when the bot is not configured / unreachable. */
export async function getBotUsername(): Promise<string | undefined> {
  if (botUsername || !isBotConfigured()) return botUsername;
  try {
    botUsername = (await getBot().api.getMe()).username;
  } catch (error) {
    console.error("❌ Could not resolve bot username:", error);
  }
  return botUsername;
}

/**
 * Referral deep link `…?startapp=ref_<code>` (read by the wizard).
 * Base: TELEGRAM_MINI_APP_LINK (t.me/<bot>/<app>), else the bot's main Mini App (t.me/<bot>).
 * Null when neither is configured (local dev without a token).
 */
export async function getInviteLink(referralCode: string): Promise<string | null> {
  let base = process.env.TELEGRAM_MINI_APP_LINK;
  if (!base) {
    const username = await getBotUsername();
    if (username) base = `https://t.me/${username}`;
  }
  return base ? `${base.replace(/\/$/, "")}?startapp=ref_${referralCode}` : null;
}

export function getBot(): Bot {
  if (instance) return instance;

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not set");
  }

  const bot = new Bot(token);

  bot.command(["start", "app"], async (ctx) => {
    await ctx.reply(TEXTS.start, { reply_markup: openAppKeyboard() });
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(TEXTS.help, { reply_markup: openAppKeyboard() });
  });

  bot.on("message:text", async (ctx) => {
    await ctx.reply(TEXTS.fallback, { reply_markup: openAppKeyboard() });
  });

  bot.catch((err) => {
    console.error("❌ Bot error:", err.error);
  });

  instance = bot;
  return bot;
}

export function isBotConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN);
}

/**
 * Sends a private message to a user. Fails softly (returns false) when the
 * bot is not configured or the user has not started the bot.
 */
export async function notifyUser(telegramId: string, text: string): Promise<boolean> {
  if (!isBotConfigured()) return false;
  try {
    await getBot().api.sendMessage(telegramId, text, {
      parse_mode: "HTML",
      reply_markup: openAppKeyboard(),
    });
    return true;
  } catch (error) {
    console.warn(`⚠️ Could not notify ${telegramId}:`, error instanceof Error ? error.message : error);
    return false;
  }
}
