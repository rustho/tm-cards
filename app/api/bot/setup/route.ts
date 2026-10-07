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

/** GET /api/bot/setup — current webhook info. Admin only. */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    if (!isBotConfigured()) {
      return NextResponse.json({ success: false, error: "TELEGRAM_BOT_TOKEN is not set" }, { status: 503 });
    }
    const [me, webhook] = await Promise.all([getBot().api.getMe(), getBot().api.getWebhookInfo()]);
    return NextResponse.json({ success: true, data: { bot: me, webhook } });
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
    const appUrl = process.env.APP_URL;
    if (!appUrl || !appUrl.startsWith("https://")) {
      return NextResponse.json({ success: false, error: "APP_URL must be an https URL" }, { status: 400 });
    }

    const bot = getBot();
    const url = `${appUrl.replace(/\/$/, "")}/api/bot/webhook`;
    await bot.api.setWebhook(url, {
      secret_token: process.env.TELEGRAM_WEBHOOK_SECRET || undefined,
      allowed_updates: ["message", "callback_query"],
      drop_pending_updates: true,
    });
    await bot.api.setMyCommands(BOT_COMMANDS);
    const webhook = await bot.api.getWebhookInfo();

    return NextResponse.json({ success: true, data: { url, webhook } });
  } catch (error) {
    return fail(error);
  }
}
