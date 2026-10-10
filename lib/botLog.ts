import { AsyncLocalStorage } from "node:async_hooks";
import { waitUntil } from "@vercel/functions";
import type { Message } from "grammy/types";
import prisma from "@/lib/prisma";

/**
 * Chat log with the bot (table `bot_messages`). Telegram's Bot API cannot
 * read a chat's history, so we keep our own copy from the moment this shipped:
 * incoming private messages (webhook middleware in lib/bot.ts) and every
 * outgoing sendMessage (API transformer in lib/bot.ts). Inserts never delay
 * the caller (waitUntil), failures are only logged.
 *
 * Who sent an outgoing message is not part of the API call, so senders wrap
 * it in `withSendContext()`; anything else (command replies) counts as `bot`.
 */

export type BotMessageSource = "user" | "bot" | "notification" | "admin" | "broadcast";

export interface SendContext {
  source: Exclude<BotMessageSource, "user">;
  /** Admin Telegram id (source admin). */
  by?: string;
  broadcastId?: string;
}

const sendContext = new AsyncLocalStorage<SendContext>();

export function withSendContext<T>(context: SendContext, fn: () => Promise<T>): Promise<T> {
  return sendContext.run(context, fn);
}

function save(data: Parameters<typeof prisma.botMessage.create>[0]["data"]) {
  waitUntil(
    prisma.botMessage
      .create({ data })
      .catch((error) => console.warn("⚠️ Bot message not logged:", error instanceof Error ? error.message : error))
  );
}

/** Text of a message, or a short marker for media / service messages. */
function describe(message: Message): string {
  if (message.text) return message.text;
  const kind = (["photo", "video", "voice", "video_note", "audio", "document", "sticker", "animation", "location", "contact", "poll"] as const).find(
    (key) => key in message
  );
  const marker = `[${kind ?? "message"}]`;
  return message.caption ? `${marker} ${message.caption}` : marker;
}

export function logIncoming(message: Message) {
  if (message.chat.type !== "private" || !message.from) return;
  save({
    telegramId: String(message.from.id),
    direction: "in",
    source: "user",
    text: describe(message).slice(0, 4096),
    telegramMessageId: message.message_id,
  });
}

/** Called by the API transformer after every sendMessage (rate-limit retries are skipped). */
export function logOutgoing(
  payload: { chat_id: number | string; text: string },
  result: { ok: true; result: { message_id: number } } | { ok: false; error_code: number; description: string }
) {
  if (!result.ok && result.error_code === 429) return;
  const context = sendContext.getStore();
  save({
    telegramId: String(payload.chat_id),
    direction: "out",
    source: context?.source ?? "bot",
    text: payload.text.slice(0, 4096),
    ok: result.ok,
    error: result.ok ? null : result.description.slice(0, 500),
    sentBy: context?.by ?? null,
    broadcastId: context?.broadcastId ?? null,
    telegramMessageId: result.ok ? result.result.message_id : null,
  });
}
