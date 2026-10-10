"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { useCachedApi } from "@/lib/apiCache";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TextInput } from "@/components/ui/text-input";
import { AdminPage, Badge, ConfirmButton, ErrorText, LoadError, Loading, Panel, Section, errorMessage } from "@/components/admin/AdminUI";
import type { AdminMatchingState, MatchingConfigDto, MatchingPreviewDto, MatchingRunDto } from "@/models/admin";

/** `/admin/matching`: preview and run the weekly matching, its config, past rounds. */
export default function AdminMatching() {
  const t = useTranslations("admin.matching");
  const { data, error, refresh } = useCachedApi<AdminMatchingState>("/api/admin/matching");
  const [preview, setPreview] = useState<MatchingPreviewDto | null>(null);
  const [run, setRun] = useState<MatchingRunDto | null>(null);
  const [busy, setBusy] = useState<"preview" | "run" | "mock" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const action = async (kind: "preview" | "run" | "mock") => {
    setBusy(kind);
    setActionError(null);
    try {
      if (kind === "preview") setPreview(await api.post<MatchingPreviewDto>("/api/admin/matching?action=preview", {}));
      if (kind === "run") {
        setRun(await api.post<MatchingRunDto>("/api/admin/matching?action=run", {}));
        setPreview(null);
        refresh();
      }
      if (kind === "mock") {
        await api.post("/api/admin/matching?action=mock-users", { count: 10 });
        setPreview(null);
      }
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <AdminPage title={t("title")}>
      <Section title={t("runTitle")}>
        <Panel className="space-y-3">
          <p className="m-0 text-body text-muted-foreground">{t("runHint")}</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => action("preview")} disabled={busy !== null}>
              {busy === "preview" ? t("previewing") : t("preview")}
            </Button>
            <ConfirmButton onConfirm={() => action("run")} disabled={busy !== null || data?.isRunning} confirmLabel={t("runConfirm")}>
              {busy === "run" ? t("running") : t("run")}
            </ConfirmButton>
            {process.env.NODE_ENV === "development" && (
              <Button variant="ghost" onClick={() => action("mock")} disabled={busy !== null}>
                {t("mockUsers")}
              </Button>
            )}
          </div>
          <ErrorText>{actionError}</ErrorText>
          {run && (
            <div className="space-y-1 rounded-md bg-muted p-3 text-body">
              <div className="font-medium text-foreground">
                {run.success ? t("runDone", { count: run.matchesCreated, week: run.roundWeekStart ?? "—" }) : t("runFailed")}
              </div>
              <div className="text-caption text-muted-foreground">
                {t("runStats", { eligible: run.eligibleUsers, unmatched: run.unmatched, notified: run.notificationsSent })}
              </div>
              {run.errors.map((e) => (
                <ErrorText key={e}>{e}</ErrorText>
              ))}
            </div>
          )}
        </Panel>
        {preview && <PreviewList preview={preview} />}
      </Section>

      {!data ? (
        error ? <LoadError onRetry={refresh} /> : <Loading />
      ) : (
        <>
          <Section title={t("rounds")}>
            {data.rounds.length === 0 ? (
              <p className="m-0 text-body text-muted-foreground">{t("noRounds")}</p>
            ) : (
              <ul className="m-0 list-none divide-y divide-divider overflow-hidden rounded-md border border-divider bg-card p-0">
                {data.rounds.map((r) => (
                  <li key={r.roundId}>
                    <Link href={`/admin/matching/${r.roundId}`} className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/60">
                      <span className="min-w-0 flex-1">
                        <span className="block text-body font-medium text-foreground">{t("week", { date: r.weekStart })}</span>
                        <span className="block text-caption text-muted-foreground">
                          {t("roundStats", { pairs: r.pairs, mutual: r.mutual, met: r.met, notMet: r.notMet })}
                        </span>
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Section>
          <ConfigForm config={data.config} onSaved={refresh} />
        </>
      )}
    </AdminPage>
  );
}

function PreviewList({ preview }: { preview: MatchingPreviewDto }) {
  const t = useTranslations("admin.matching");
  return (
    <Panel className="space-y-3">
      <div className="text-body font-medium text-foreground">
        {t("previewSummary", { pairs: preview.pairs.length, eligible: preview.eligibleUsers })}
      </div>
      {preview.pairs.length > 0 && (
        <ul className="m-0 list-none space-y-1.5 p-0">
          {preview.pairs.map(({ a, b, score }) => (
            <li key={`${a.telegramId}-${b.telegramId}`} className="flex items-center gap-2 text-body">
              <Badge>{score}</Badge>
              <span className="min-w-0 flex-1 truncate">
                <Link href={`/admin/users/${a.telegramId}`} className="text-primary hover:underline">{a.name}</Link>
                {" ↔ "}
                <Link href={`/admin/users/${b.telegramId}`} className="text-primary hover:underline">{b.name}</Link>
              </span>
              <span className="shrink-0 text-caption text-muted-foreground">{a.place}</span>
            </li>
          ))}
        </ul>
      )}
      {preview.unmatched.length > 0 && (
        <div className="text-caption text-muted-foreground">
          {t("unmatched")}: {preview.unmatched.map((u) => `${u.name}${u.place ? ` (${u.place})` : ""}`).join(", ")}
        </div>
      )}
    </Panel>
  );
}

function ConfigForm({ config, onSaved }: { config: MatchingConfigDto; onSaved: () => void }) {
  const t = useTranslations("admin.matching");
  const [form, setForm] = useState(() => toForm(config));
  const [state, setState] = useState<{ kind: "idle" | "saving" | "saved" } | { kind: "error"; message: string }>({ kind: "idle" });

  useEffect(() => setForm(toForm(config)), [config]);

  const save = async () => {
    setState({ kind: "saving" });
    try {
      await api.put<MatchingConfigDto>("/api/admin/matching", {
        maxMatchesPerRun: Number(form.maxMatchesPerRun),
        minCompatibilityScore: Number(form.minCompatibilityScore),
        cooldownHours: Number(form.cooldownHours),
        enableNotifications: form.enableNotifications,
        countriesWithoutRegions: form.countriesWithoutRegions.split(","),
      });
      setState({ kind: "saved" });
      onSaved();
    } catch (e) {
      setState({ kind: "error", message: errorMessage(e) });
    }
  };

  const field = (key: "maxMatchesPerRun" | "minCompatibilityScore" | "cooldownHours" | "countriesWithoutRegions", inputMode: "numeric" | "decimal" | "text") => (
    <label className="block space-y-1">
      <span className="block text-caption text-muted-foreground">{t(`config.${key}`)}</span>
      <TextInput value={form[key]} inputMode={inputMode} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
    </label>
  );

  return (
    <Section title={t("configTitle")}>
      <Panel className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {field("maxMatchesPerRun", "numeric")}
          {field("minCompatibilityScore", "decimal")}
          {field("cooldownHours", "numeric")}
        </div>
        {field("countriesWithoutRegions", "text")}
        <label className="flex items-center gap-2 text-body text-foreground">
          <Switch checked={form.enableNotifications} onCheckedChange={(enableNotifications) => setForm({ ...form, enableNotifications })} />
          {t("config.enableNotifications")}
        </label>
        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={state.kind === "saving"}>
            {t("save")}
          </Button>
          {state.kind === "saved" && <span className="text-caption text-success">{t("saved")}</span>}
        </div>
        {state.kind === "error" && <ErrorText>{state.message}</ErrorText>}
      </Panel>
    </Section>
  );
}

const toForm = (c: MatchingConfigDto) => ({
  maxMatchesPerRun: String(c.maxMatchesPerRun),
  minCompatibilityScore: String(c.minCompatibilityScore),
  cooldownHours: String(c.cooldownHours),
  enableNotifications: c.enableNotifications,
  countriesWithoutRegions: c.countriesWithoutRegions.join(", "),
});
