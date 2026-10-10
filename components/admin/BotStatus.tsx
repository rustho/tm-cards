"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { useCachedApi } from "@/lib/apiCache";
import { Badge, ConfirmButton, ErrorText, Panel, errorMessage, formatDate } from "@/components/admin/AdminUI";

type WebhookInfo = {
  url: string;
  pending_update_count: number;
  last_error_date?: number;
  last_error_message?: string;
  allowed_updates?: string[];
};
type BotSetup = { success: boolean; data: { bot: { username: string }; webhook: WebhookInfo; expectedUrl: string | null } };

const REQUIRED_UPDATES = ["message", "my_chat_member"];

/**
 * Webhook health on the admin home: without a webhook the bot receives nothing
 * (no /start replies, no incoming messages in the chat log). «Подключить» calls
 * POST /api/bot/setup.
 */
export function BotStatus() {
  const t = useTranslations("admin.bot");
  const locale = useLocale();
  const { data, error, refresh } = useCachedApi<BotSetup>("/api/bot/setup");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const connect = async () => {
    setBusy(true);
    setActionError(null);
    try {
      await api.post("/api/bot/setup", {});
      refresh();
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (!data) return error ? <ErrorText>{errorMessage(error)}</ErrorText> : null;

  const { webhook, expectedUrl, bot } = data.data;
  const problems = [
    !webhook.url && t("noWebhook"),
    webhook.url && expectedUrl && webhook.url !== expectedUrl && t("wrongUrl", { url: webhook.url }),
    webhook.url &&
      webhook.allowed_updates &&
      REQUIRED_UPDATES.some((u) => !webhook.allowed_updates!.includes(u)) &&
      t("missingUpdates"),
  ].filter(Boolean) as string[];
  const healthy = problems.length === 0;

  return (
    <Panel className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-body font-medium text-foreground">@{bot.username}</span>
        <Badge tone={healthy ? "success" : "danger"}>{healthy ? t("ok") : t("broken")}</Badge>
        {webhook.pending_update_count > 0 && <Badge tone="warning">{t("pending", { count: webhook.pending_update_count })}</Badge>}
      </div>
      {problems.map((p) => (
        <p key={p} className="m-0 text-caption text-destructive">{p}</p>
      ))}
      {webhook.last_error_message && (
        <p className="m-0 text-caption text-muted-foreground">
          {t("lastError", {
            date: formatDate(new Date((webhook.last_error_date ?? 0) * 1000).toISOString(), locale, true),
            error: webhook.last_error_message,
          })}
        </p>
      )}
      <div className="flex items-center gap-2">
        <ConfirmButton size="sm" variant={healthy ? "outline" : "default"} disabled={busy} onConfirm={connect}>
          {busy ? t("connecting") : healthy ? t("reconnect") : t("connect")}
        </ConfirmButton>
      </div>
      <ErrorText>{actionError}</ErrorText>
    </Panel>
  );
}
