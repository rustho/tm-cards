import { NextRequest, NextResponse } from "next/server";
import { BOT_COMMANDS, getBot, isBotConfigured } from "@/lib/bot";
import { requireAdmin, authErrorResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function fail(error: unknown) {
  const auth = authErrorResponse(error);
  if (auth) return auth;
  console.error("Bot setup error:", error);
  return NextResponse.json(
    { success: false, error: error instanceof Error ? error.message : "Unknown error" },
    { status: 500 }
  );
}

function expectedWebhookUrl(): string | null {
  const appUrl = process.env.APP_URL;
  return appUrl?.startsWith("https://") ? `${appUrl.replace(/\/$/, "")}/api/bot/webhook` : null;
}

/** GET /api/bot/setup — bot, current webhook info and the URL it should point to. Admin only. */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    if (!isBotConfigured()) {
      return NextResponse.json({ success: false, error: "TELEGRAM_BOT_TOKEN is not set" }, { status: 503 });
    }
    const [me, webhook] = await Promise.all([getBot().api.getMe(), getBot().api.getWebhookInfo()]);
    return NextResponse.json({ success: true, data: { bot: me, webhook, expectedUrl: expectedWebhookUrl() } });
  } catch (error) {
    return fail(error);
  }
}

/**
 * POST /api/bot/setup — registers the webhook at `${APP_URL}/api/bot/webhook`
 * and publishes the command list. Admin only.
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    if (!isBotConfigured()) {
      return NextResponse.json({ success: false, error: "TELEGRAM_BOT_TOKEN is not set" }, { status: 503 });
    }
    const url = expectedWebhookUrl();
    if (!url) {
      return NextResponse.json({ success: false, error: "APP_URL must be an https URL" }, { status: 400 });
    }

    const bot = getBot();
    await bot.api.setWebhook(url, {
      secret_token: process.env.TELEGRAM_WEBHOOK_SECRET || undefined,
      allowed_updates: ["message", "callback_query", "my_chat_member"],
      // Keep updates queued while the webhook was missing: they are user messages for the chat log.
      drop_pending_updates: false,
    });
    await bot.api.setMyCommands(BOT_COMMANDS);
    const webhook = await bot.api.getWebhookInfo();

    return NextResponse.json({ success: true, data: { url, webhook } });
  } catch (error) {
    return fail(error);
  }
}
