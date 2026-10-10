"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { useCachedApi, writeCache } from "@/lib/apiCache";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TextArea } from "@/components/ui/text-area";
import { AdminPage, ConfirmButton, ErrorText, LoadError, Loading, Panel, Section, errorMessage, formatDate } from "@/components/admin/AdminUI";
import { BroadcastProgress } from "@/components/admin/BroadcastProgress";
import { cn } from "@/lib/utils";
import { BROADCAST_SEGMENTS, MESSAGE_MAX_LENGTH, type BroadcastAudience, type BroadcastDetails, type BroadcastDto, type BroadcastSegmentId } from "@/models/admin";

type Reference = { locations: { country: string }[] };

/** `/admin/broadcasts`: compose (segment → text → test to myself → send) and the history. */
export default function AdminBroadcasts() {
  const t = useTranslations("admin.broadcasts");
  const locale = useLocale();
  const router = useRouter();
  const { data: history, error, refresh } = useCachedApi<BroadcastDto[]>("/api/admin/broadcasts");
  const { data: reference } = useCachedApi<Reference>("/api/reference");

  const [segment, setSegment] = useState<BroadcastSegmentId>("all");
  const [country, setCountry] = useState("");
  const [text, setText] = useState("");
  const [withAppButton, setWithAppButton] = useState(true);
  const [state, setState] = useState<{ kind: "idle" | "testing" | "tested" | "creating" } | { kind: "error"; message: string }>({ kind: "idle" });

  const audienceUrl = `/api/admin/broadcasts/audience?${new URLSearchParams({ segment, ...(country ? { country } : {}) })}`;
  const { data: audience } = useCachedApi<BroadcastAudience>(audienceUrl);

  const test = async () => {
    setState({ kind: "testing" });
    try {
      const result = await api.post<{ ok: boolean; error?: string }>("/api/admin/broadcasts/test", { text, withAppButton });
      setState(result.ok ? { kind: "tested" } : { kind: "error", message: result.error ?? t("testFailed") });
    } catch (e) {
      setState({ kind: "error", message: errorMessage(e) });
    }
  };

  const create = async () => {
    setState({ kind: "creating" });
    try {
      const broadcast = await api.post<BroadcastDetails>("/api/admin/broadcasts", {
        text,
        withAppButton,
        segment: { id: segment, ...(country ? { country } : {}) },
      });
      writeCache(`/api/admin/broadcasts/${broadcast.id}`, broadcast);
      router.push(`/admin/broadcasts/${broadcast.id}`);
    } catch (e) {
      setState({ kind: "error", message: errorMessage(e) });
    }
  };

  const busy = state.kind === "testing" || state.kind === "creating";
  const countries = reference?.locations.map((l) => l.country) ?? [];

  return (
    <AdminPage title={t("title")}>
      <Section title={t("newTitle")}>
        <Panel className="space-y-4">
          <div className="space-y-1.5">
            <div className="text-caption text-muted-foreground">{t("segment")}</div>
            <div className="flex flex-wrap gap-1.5">
              {BROADCAST_SEGMENTS.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSegment(id)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-chip transition-colors",
                    segment === id ? "border-primary bg-primary-muted text-primary" : "border-divider bg-card text-muted-foreground"
                  )}
                >
                  {t(`segments.${id}`)}
                </button>
              ))}
            </div>
            <p className="m-0 text-caption text-muted-foreground">{t(`segmentHints.${segment}`)}</p>
          </div>

          <label className="block space-y-1.5">
            <span className="block text-caption text-muted-foreground">{t("country")}</span>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="h-11 w-full rounded-md border border-divider bg-surface px-3 text-body text-foreground"
            >
              <option value="">{t("anyCountry")}</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-1.5">
            <TextArea value={text} onChange={(e) => setText(e.target.value)} maxLength={MESSAGE_MAX_LENGTH} placeholder={t("textPlaceholder")} />
            <p className="m-0 text-caption text-muted-foreground">{t.raw("textHint") as string}</p>
          </div>

          <label className="flex items-center gap-2 text-body text-foreground">
            <Switch checked={withAppButton} onCheckedChange={setWithAppButton} />
            {t("withAppButton")}
          </label>

          <div className="rounded-md bg-muted px-3 py-2 text-body text-foreground">
            {audience ? t("audience", { reachable: audience.reachable, total: audience.total }) : t("audienceLoading")}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={test} disabled={!text.trim() || busy}>
              {state.kind === "testing" ? t("testing") : t("test")}
            </Button>
            <ConfirmButton
              onConfirm={create}
              disabled={!text.trim() || busy || !audience?.reachable}
              confirmLabel={t("sendConfirm", { count: audience?.reachable ?? 0 })}
            >
              {state.kind === "creating" ? t("creating") : t("send")}
            </ConfirmButton>
          </div>
          {state.kind === "tested" && <p className="m-0 text-caption text-success">{t("tested")}</p>}
          {state.kind === "error" && <ErrorText>{state.message}</ErrorText>}
        </Panel>
      </Section>

      <Section title={t("history")}>
        {!history ? (
          error ? <LoadError onRetry={refresh} /> : <Loading />
        ) : history.length === 0 ? (
          <p className="m-0 text-body text-muted-foreground">{t("empty")}</p>
        ) : (
          <ul className="m-0 list-none space-y-2 p-0">
            {history.map((b) => (
              <li key={b.id}>
                <Link href={`/admin/broadcasts/${b.id}`} className="block space-y-2 rounded-md border border-divider bg-card p-3 transition-colors hover:bg-muted/60">
                  <div className="flex justify-between gap-2 text-caption text-muted-foreground">
                    <span>{t(`segments.${b.segment.id}`)}{b.segment.country ? ` · ${b.segment.country}` : ""}</span>
                    <span>{formatDate(b.createdAt, locale, true)}</span>
                  </div>
                  <p className="m-0 line-clamp-2 whitespace-pre-line text-body text-foreground">{b.text}</p>
                  <BroadcastProgress broadcast={b} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </AdminPage>
  );
}
