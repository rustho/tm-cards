"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { useCachedApi } from "@/lib/apiCache";
import { Button } from "@/components/ui/button";
import { ErrorText, Loading, formatDate, errorMessage } from "@/components/admin/AdminUI";
import { cn } from "@/lib/utils";
import type { BotDialogDto, BotMessageDto } from "@/models/admin";

/** Telegram HTML → plain text for the log view. */
const plain = (html: string) =>
  html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");

/**
 * The user's chat with the bot as bubbles (theirs left, ours right, labelled by
 * who sent it). `version` bumps after the admin sends something, to reload.
 */
export function BotDialog({ telegramId, version }: { telegramId: string; version: number }) {
  const t = useTranslations("admin.dialog");
  const locale = useLocale();
  const url = `/api/admin/users/${telegramId}/messages`;
  const { data, error, refresh } = useCachedApi<BotDialogDto>(url);
  const [older, setOlder] = useState<BotMessageDto[]>([]);
  const [hasMoreOlder, setHasMoreOlder] = useState<boolean | null>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [olderError, setOlderError] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (version > 0) refresh();
  }, [version, refresh]);

  // Open at the newest message.
  const newestId = data?.messages.at(-1)?.id;
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [newestId]);

  const loadOlder = async () => {
    const first = older[0] ?? data?.messages[0];
    if (!first) return;
    setLoadingOlder(true);
    setOlderError(null);
    try {
      const page = await api.get<BotDialogDto>(`${url}?before=${encodeURIComponent(first.createdAt)}`);
      setOlder((current) => [...page.messages, ...current]);
      setHasMoreOlder(page.hasMore);
    } catch (e) {
      setOlderError(errorMessage(e));
    } finally {
      setLoadingOlder(false);
    }
  };

  if (!data) return error ? <ErrorText>{t("loadFailed")}</ErrorText> : <Loading />;

  const messages = [...older, ...data.messages];
  const hasMore = hasMoreOlder ?? data.hasMore;

  const label = (m: BotMessageDto) => {
    if (m.source === "admin") return t("from.admin", { id: m.sentBy ?? "?" });
    return t(`from.${m.source}`);
  };

  return (
    <div className="space-y-2">
      <div ref={scroller} className="max-h-[60vh] space-y-2 overflow-y-auto rounded-md border border-divider bg-muted/40 p-3">
        {hasMore && (
          <div className="flex justify-center">
            <Button variant="outline" size="sm" onClick={loadOlder} disabled={loadingOlder}>
              {loadingOlder ? t("loading") : t("older")}
            </Button>
          </div>
        )}
        <ErrorText>{olderError}</ErrorText>
        {messages.length === 0 ? (
          <p className="m-0 py-6 text-center text-body text-muted-foreground">{t("empty")}</p>
        ) : (
          messages.map((m) => {
            const mine = m.direction === "out";
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] space-y-1 rounded-md border px-3 py-2",
                    mine ? "border-primary/30 bg-primary-muted" : "border-divider bg-card",
                    !m.ok && "border-destructive/50"
                  )}
                >
                  <div className="flex flex-wrap gap-x-2 text-caption text-muted-foreground">
                    <span>
                      {m.source === "broadcast" && m.broadcastId ? (
                        <Link href={`/admin/broadcasts/${m.broadcastId}`} className="text-primary hover:underline">
                          {label(m)}
                        </Link>
                      ) : (
                        label(m)
                      )}
                    </span>
                    <span>{formatDate(m.createdAt, locale, true)}</span>
                  </div>
                  <p className="m-0 whitespace-pre-line break-words text-body text-foreground">{plain(m.text)}</p>
                  {!m.ok && <p className="m-0 text-caption text-destructive">{t("notDelivered", { error: m.error ?? "" })}</p>}
                </div>
              </div>
            );
          })
        )}
      </div>
      <p className="m-0 text-caption text-muted-foreground">{t("hint")}</p>
    </div>
  );
}
