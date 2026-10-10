"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { invalidateCache, useCachedApi } from "@/lib/apiCache";
import { Button } from "@/components/ui/button";
import { AdminPage, ConfirmButton, ErrorText, LoadError, Loading, Panel, Section, errorMessage, formatDate } from "@/components/admin/AdminUI";
import { BroadcastProgress } from "@/components/admin/BroadcastProgress";
import type { BroadcastDetails } from "@/models/admin";

/**
 * `/admin/broadcasts/[id]`: progress and failures. While the broadcast is
 * sending and this screen is open, it keeps asking the server for the next
 * batch; closing the screen pauses it, «Продолжить» resumes.
 */
export default function AdminBroadcast({ params }: { params: { id: string } }) {
  const t = useTranslations("admin.broadcasts");
  const locale = useLocale();
  const url = `/api/admin/broadcasts/${params.id}`;
  const { data, error, refresh, mutate } = useCachedApi<BroadcastDetails>(url);
  const [sending, setSending] = useState(false);
  const [paused, setPaused] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const status = data?.status;
  useEffect(() => {
    if (status !== "sending" || sending || paused || sendError) return;
    let cancelled = false;
    (async () => {
      setSending(true);
      try {
        while (!cancelled && alive.current) {
          const next = await api.post<BroadcastDetails>(url, { action: "send" });
          if (!alive.current) break;
          mutate(next);
          if (next.status !== "sending") break;
        }
      } catch (e) {
        if (alive.current) setSendError(errorMessage(e));
      } finally {
        if (alive.current) setSending(false);
        invalidateCache("/api/admin/broadcasts");
      }
    })();
    return () => {
      cancelled = true;
    };
    // `sending` is set inside; re-running on it would start a second loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, paused, sendError, url]);

  const cancel = async () => {
    setPaused(true);
    try {
      mutate(await api.post<BroadcastDetails>(url, { action: "cancel" }));
      invalidateCache("/api/admin/broadcasts");
    } catch (e) {
      setSendError(errorMessage(e));
    }
  };

  return (
    <AdminPage title={t("detailTitle")}>
      {!data ? (
        error ? <LoadError onRetry={refresh} /> : <Loading />
      ) : (
        <>
          <Panel className="space-y-3">
            <BroadcastProgress broadcast={data} />
            <div className="text-caption text-muted-foreground">
              {t(`segments.${data.segment.id}`)}
              {data.segment.country ? ` · ${data.segment.country}` : ""} · {formatDate(data.createdAt, locale, true)}
              {data.finishedAt && ` → ${formatDate(data.finishedAt, locale, true)}`}
            </div>
            {data.status === "sending" && (
              <div className="flex flex-wrap items-center gap-2">
                {sending && !paused ? (
                  <>
                    <span className="text-body text-foreground">{t("sendingNow")}</span>
                    <Button variant="outline" size="sm" onClick={() => setPaused(true)}>
                      {t("pause")}
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      setSendError(null);
                      setPaused(false);
                    }}
                    disabled={sending}
                  >
                    {t("resume")}
                  </Button>
                )}
                <ConfirmButton variant="ghost" size="sm" className="text-destructive" onConfirm={cancel}>
                  {t("cancel")}
                </ConfirmButton>
              </div>
            )}
            {data.status === "sending" && <p className="m-0 text-caption text-muted-foreground">{t("keepOpen")}</p>}
            <ErrorText>{sendError}</ErrorText>
          </Panel>

          <Section title={t("message")}>
            <Panel>
              <p className="m-0 whitespace-pre-line break-words text-body text-foreground">{data.text}</p>
            </Panel>
          </Section>

          {data.failures.length > 0 && (
            <Section title={t("failures", { count: data.failures.length })}>
              <ul className="m-0 list-none divide-y divide-divider overflow-hidden rounded-md border border-divider bg-card p-0">
                {data.failures.map((f) => (
                  <li key={f.telegramId} className="px-3 py-2 text-body">
                    <Link href={`/admin/users/${f.telegramId}`} className="text-primary hover:underline">
                      {f.name}
                    </Link>
                    <span className="text-muted-foreground"> · {t(`failure.${f.status}`)}</span>
                    {f.error && <div className="break-words text-caption text-muted-foreground">{f.error}</div>}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </>
      )}
    </AdminPage>
  );
}
