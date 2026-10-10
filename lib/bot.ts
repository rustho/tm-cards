import { Bot, GrammyError, InlineKeyboard } from "grammy";
import prisma from "@/lib/prisma";
import { track } from "@/lib/events";
import { logIncoming, logOutgoing, withSendContext, type SendContext } from "@/lib/botLog";

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

  // Chat log (lib/botLog.ts): every outgoing message, whoever sends it…
  bot.api.config.use(async (prev, method, payload, signal) => {
    const result = await prev(method, payload, signal);
    if (method === "sendMessage") {
      logOutgoing(payload as { chat_id: number | string; text: string }, result as Parameters<typeof logOutgoing>[1]);
    }
    return result;
  });
  // …and every incoming private message, before the handlers below.
  bot.use(async (ctx, next) => {
    if (ctx.message) logIncoming(ctx.message);
    await next();
  });

  bot.command(["start", "app"], async (ctx) => {
    if (ctx.message?.text?.startsWith("/start")) await markReachable(String(ctx.from?.id ?? ""), "bot_started");
    await ctx.reply(TEXTS.start, { reply_markup: openAppKeyboard() });
  });

  // Telegram reports when a user blocks (kicked) or unblocks (member) the bot in the private chat.
  bot.on("my_chat_member", async (ctx) => {
    if (ctx.chat.type !== "private") return;
    const telegramId = String(ctx.from.id);
    const status = ctx.myChatMember.new_chat_member.status;
    if (status === "kicked") await markBlocked(telegramId);
    else if (status === "member") await markReachable(telegramId, "bot_unblocked");
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

/** Remembers that the bot cannot write to this user (blocked, deactivated or never started). */
async function markBlocked(telegramId: string) {
  const { count } = await prisma.user
    .updateMany({ where: { telegramId, botBlockedAt: null }, data: { botBlockedAt: new Date() } })
    .catch(() => ({ count: 0 }));
  if (count > 0) {
    console.log(`🚫 Bot blocked by ${telegramId}`);
    const user = await prisma.user.findUnique({ where: { telegramId }, select: { id: true } });
    if (user) track("bot_blocked", user.id);
  }
}

/** /start or unblock: the user can be messaged again. Users who never opened the app have no row and are skipped. */
async function markReachable(telegramId: string, event: "bot_started" | "bot_unblocked") {
  const user = await prisma.user.findUnique({ where: { telegramId }, select: { id: true, botBlockedAt: true } }).catch(() => null);
  if (!user) return;
  if (user.botBlockedAt) await prisma.user.update({ where: { id: user.id }, data: { botBlockedAt: null } });
  track(event, user.id);
}

export type SendResult = { ok: true } | { ok: false; blocked: boolean; error: string };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Sends a private HTML message. 403 (blocked / not started) marks the user
 * unreachable; a 429 is retried once after Telegram's `retry_after`.
 * `context` says who sends it for the chat log (default: a notification).
 */
export async function sendToUser(
  telegramId: string,
  text: string,
  { withAppButton = true, context = { source: "notification" } }: { withAppButton?: boolean; context?: SendContext } = {}
): Promise<SendResult> {
  if (!isBotConfigured()) return { ok: false, blocked: false, error: "Bot is not configured" };
  const options = { parse_mode: "HTML" as const, reply_markup: withAppButton ? openAppKeyboard() : undefined };
  for (let attempt = 0; ; attempt++) {
    try {
      await withSendContext(context, () => getBot().api.sendMessage(telegramId, text, options));
      return { ok: true };
    } catch (error) {
      if (error instanceof GrammyError && error.error_code === 429 && attempt === 0) {
        await sleep(((error.parameters.retry_after ?? 1) + 0.5) * 1000);
        continue;
      }
      const message = error instanceof Error ? error.message : String(error);
      const blocked = error instanceof GrammyError && error.error_code === 403;
      if (blocked) await markBlocked(telegramId);
      return { ok: false, blocked, error: message };
    }
  }
}

/**
 * Sends a notification with the «Открыть TravelMate» button. Fails softly
 * (returns false) when the bot is not configured or cannot reach the user.
 */
export async function notifyUser(telegramId: string, text: string): Promise<boolean> {
  const result = await sendToUser(telegramId, text);
  if (!result.ok) console.warn(`⚠️ Could not notify ${telegramId}: ${result.error}`);
  return result.ok;
}
