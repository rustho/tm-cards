import { NextRequest, NextResponse } from "next/server";
import { webhookCallback } from "grammy";
import { getBot, isBotConfigured } from "@/lib/bot";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/bot/webhook — Telegram delivers updates here.
 * Register it with POST /api/bot/setup. The secret token set there is
 * verified by grammY on every update.
 */
export async function POST(request: NextRequest) {
  if (!isBotConfigured()) {
    return NextResponse.json({ error: "Bot is not configured" }, { status: 503 });
  }
  const handler = webhookCallback(getBot(), "std/http", {
    secretToken: process.env.TELEGRAM_WEBHOOK_SECRET || undefined,
  });
  return handler(request);
}
