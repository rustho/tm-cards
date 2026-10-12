"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { invalidateCache, useCachedApi } from "@/lib/apiCache";
import { Switch } from "@/components/ui/switch";
import { AdminPage, ConfirmButton, ErrorText, LoadError, Loading, Panel, Section, Stat, errorMessage, formatDate } from "@/components/admin/AdminUI";
import { MatchCard } from "@/components/admin/MatchCard";
import { UserPicker } from "@/components/admin/UserPicker";
import type { AdminMatchAction, AdminRoundAction, AdminRoundDetails, AdminUserRow, PublishResultDto } from "@/models/admin";

/**
 * `/admin/matching/[roundId]`: every pair of a round. Draft pairs (not shown to users yet) are
 * reviewed here and published in one go; pairs can be added by hand, edited, cancelled or deleted.
 */
export default function AdminRound({ params }: { params: { roundId: string } }) {
  const t = useTranslations("admin.matching");
  const url = `/api/admin/matching/rounds/${params.roundId}`;
  const { data, error, refresh, mutate } = useCachedApi<AdminRoundDetails>(url);
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [published, setPublished] = useState<PublishResultDto | null>(null);

  /** Runs an action that returns the updated round; true on success. */
  const run = async (key: string, request: () => Promise<AdminRoundDetails>) => {
    setBusy(key);
    setActionError(null);
    try {
      const next = await request();
      setPublished((next as AdminRoundDetails & { result?: PublishResultDto }).result ?? null);
      mutate(next);
      invalidateCache("/api/admin/matching");
      return true;
    } catch (e) {
      setActionError(errorMessage(e));
      return false;
    } finally {
      setBusy(null);
    }
  };

  const matchAction = (matchId: string) => (body: AdminMatchAction) =>
    run(matchId, () => api.post<AdminRoundDetails>(`/api/admin/matching/matches/${matchId}`, body));

  return (
    <AdminPage title={data ? t("week", { date: data.weekStart }) : t("round")}>
      {!data ? (
        error ? <LoadError onRetry={refresh} /> : <Loading />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label={t("pairs")} value={data.pairs} />
            <Stat label={t("mutual")} value={data.mutual} />
            <Stat label={t("met")} value={data.met} />
            <Stat label={t("notMet")} value={data.notMet} />
          </div>

          {data.drafts > 0 && (
            <DraftBanner
              round={data}
              busy={busy === "publish" || busy === "discard"}
              onPublish={(notify) => run("publish", () => api.post<AdminRoundDetails>(url, { action: "publish", notify } satisfies AdminRoundAction))}
              onDiscard={() => run("discard", () => api.post<AdminRoundDetails>(url, { action: "discardDrafts" } satisfies AdminRoundAction))}
            />
          )}
          {published && (
            <p className="m-0 text-body text-success">{t("publishedResult", { count: published.published, notified: published.notified })}</p>
          )}

          <AddPair
            busy={busy === "create"}
            onCreate={(body) => run("create", () => api.post<AdminRoundDetails>(url, body))}
          />

          <ErrorText>{actionError}</ErrorText>
          <Section title={t("pairsTitle", { count: data.matches.length })}>
            {data.matches.length === 0 ? (
              <p className="m-0 text-body text-muted-foreground">{t("noPairs")}</p>
            ) : (
              <div className="space-y-2">
                {data.matches.map((m) => (
                  <MatchCard key={m.matchId} match={m} onAction={matchAction(m.matchId)} busy={busy === m.matchId} />
                ))}
              </div>
            )}
          </Section>
        </>
      )}
    </AdminPage>
  );
}

function DraftBanner({
  round,
  busy,
  onPublish,
  onDiscard,
}: {
  round: AdminRoundDetails;
  busy: boolean;
  onPublish: (notify: boolean) => void;
  onDiscard: () => void;
}) {
  const t = useTranslations("admin.matching");
  const locale = useLocale();
  const [notify, setNotify] = useState(true);
  const deadlinePassed = new Date(round.agreeDeadline).getTime() < Date.now();
  return (
    <Panel className="space-y-3 border-warning bg-warning/10">
      <div className="space-y-1">
        <div className="text-body font-medium text-foreground">{t("draftTitle", { count: round.drafts })}</div>
        <p className="m-0 text-caption text-muted-foreground">{t("draftHint")}</p>
        <p className={deadlinePassed ? "m-0 text-caption text-destructive" : "m-0 text-caption text-muted-foreground"}>
          {t(deadlinePassed ? "deadlinePassed" : "deadline", { date: formatDate(round.agreeDeadline, locale, true) })}
        </p>
      </div>
      <label className="flex items-center gap-2 text-body text-foreground">
        <Switch checked={notify} onCheckedChange={setNotify} />
        {t("publishNotify", { count: round.drafts * 2 })}
      </label>
      <div className="flex flex-wrap gap-2">
        <ConfirmButton size="sm" disabled={busy} onConfirm={() => onPublish(notify)} confirmLabel={t("publishConfirm", { count: round.drafts })}>
          {t("publish", { count: round.drafts })}
        </ConfirmButton>
        <ConfirmButton variant="ghost" size="sm" className="text-destructive" disabled={busy} onConfirm={onDiscard}>
          {t("discardDrafts")}
        </ConfirmButton>
      </div>
    </Panel>
  );
}

function AddPair({ busy, onCreate }: { busy: boolean; onCreate: (body: AdminRoundAction) => Promise<boolean> }) {
  const t = useTranslations("admin.matching");
  const [a, setA] = useState<AdminUserRow | null>(null);
  const [b, setB] = useState<AdminUserRow | null>(null);
  const [publish, setPublish] = useState(false);
  const [notify, setNotify] = useState(true);

  const create = async () => {
    if (!a || !b) return;
    if (await onCreate({ action: "createMatch", a: a.telegramId, b: b.telegramId, publish, notify: publish && notify })) {
      setA(null);
      setB(null);
    }
  };

  return (
    <Section title={t("addPair")}>
      <Panel className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <UserPicker value={a} onChange={setA} placeholder={t("firstPerson")} />
          <UserPicker value={b} onChange={setB} placeholder={t("secondPerson")} />
        </div>
        <label className="flex items-center gap-2 text-body text-foreground">
          <Switch checked={publish} onCheckedChange={setPublish} />
          {t("publishNow")}
        </label>
        {publish && (
          <label className="flex items-center gap-2 text-body text-foreground">
            <Switch checked={notify} onCheckedChange={setNotify} />
            {t("notifyBoth")}
          </label>
        )}
        <p className="m-0 text-caption text-muted-foreground">{t(publish ? "addPairHint" : "addPairDraftHint")}</p>
        <ConfirmButton size="sm" onConfirm={create} disabled={busy || !a || !b || a.telegramId === b.telegramId}>
          {t("addPairButton")}
        </ConfirmButton>
      </Panel>
    </Section>
  );
}
