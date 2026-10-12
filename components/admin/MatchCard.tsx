"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge, ConfirmButton, type BadgeTone } from "@/components/admin/AdminUI";
import { UserPicker } from "@/components/admin/UserPicker";
import { cn } from "@/lib/utils";
import { MATCH_STATUSES, type AdminMatchAction, type AdminMatchRow, type AdminUserRow, type MatchSide, type MatchStatusId } from "@/models/admin";

const STATUS_TONES: Record<string, BadgeTone> = {
  pending: "primary",
  met: "success",
  not_met: "warning",
  postponed: "neutral",
  expired: "danger",
};

/**
 * One pair: both sides with «Хочу познакомиться» and their feedback. With `onAction`
 * (round screen) it can be cancelled, deleted, or edited: status, accepts, or a new person on a side.
 */
export function MatchCard({
  match,
  showWeek = false,
  onAction,
  busy,
}: {
  match: AdminMatchRow;
  showWeek?: boolean;
  onAction?: (body: AdminMatchAction) => Promise<boolean>;
  busy?: boolean;
}) {
  const t = useTranslations("admin.match");
  const [editing, setEditing] = useState(false);
  const canCancel = match.status === "pending" || match.status === "postponed";

  const side = (s: AdminMatchRow["a"]) => (
    <div className="min-w-0 flex-1 space-y-0.5">
      <Link href={`/admin/users/${s.telegramId}`} className="block truncate text-body font-medium text-primary hover:underline">
        {s.name}
      </Link>
      <div className="flex items-center gap-1 text-caption text-muted-foreground">
        {s.acceptedAt ? <Check className="size-3.5 text-success" /> : <span className="inline-block size-3.5 text-center">·</span>}
        {s.acceptedAt ? t("accepted") : t("notAccepted")}
      </div>
      {s.feedback && (
        <div className="text-caption text-muted-foreground">
          {s.feedback.met
            ? t("feedbackMet", { count: s.feedback.impressions.length })
            : t("feedbackNotMet", { reason: s.feedback.reason ?? "—" })}
          {s.feedback.text && <span className="block italic">«{s.feedback.text}»</span>}
        </div>
      )}
    </div>
  );

  return (
    <div className={cn("space-y-2 rounded-md border bg-card p-3", editing ? "border-primary" : "border-divider")}>
      <div className="flex flex-wrap items-center gap-1.5">
        {!match.publishedAt && <Badge tone="warning">{t("draft")}</Badge>}
        <Badge tone={STATUS_TONES[match.status] ?? "neutral"}>{t(`status.${match.status}`)}</Badge>
        <span className="text-caption text-muted-foreground">
          {t("score", { score: match.score })}
          {showWeek && ` · ${t("week", { date: match.weekStart })}`}
        </span>
        {onAction && (
          <span className="ml-auto flex gap-1">
            <Button variant="ghost" size="sm" className="h-7 px-2" disabled={busy} onClick={() => setEditing(!editing)}>
              {editing ? t("close") : t("edit")}
            </Button>
            {canCancel && (
              <ConfirmButton variant="ghost" size="sm" className="h-7 px-2" disabled={busy} onConfirm={() => onAction({ action: "cancel" })}>
                {t("cancel")}
              </ConfirmButton>
            )}
            <ConfirmButton variant="ghost" size="sm" className="h-7 px-2 text-destructive" disabled={busy} onConfirm={() => onAction({ action: "delete" })}>
              {t("delete")}
            </ConfirmButton>
          </span>
        )}
      </div>
      <div className="flex gap-3">
        {side(match.a)}
        {side(match.b)}
      </div>
      {editing && onAction && <MatchEditor match={match} busy={busy} onAction={onAction} onDone={() => setEditing(false)} />}
    </div>
  );
}

function MatchEditor({
  match,
  busy,
  onAction,
  onDone,
}: {
  match: AdminMatchRow;
  busy?: boolean;
  onAction: (body: AdminMatchAction) => Promise<boolean>;
  onDone: () => void;
}) {
  const t = useTranslations("admin.match");
  const [status, setStatus] = useState<MatchStatusId>(match.status as MatchStatusId);
  const [accepted, setAccepted] = useState({ a: Boolean(match.a.acceptedAt), b: Boolean(match.b.acceptedAt) });
  const [replaceSide, setReplaceSide] = useState<MatchSide>("b");
  const [replacement, setReplacement] = useState<AdminUserRow | null>(null);
  const [notify, setNotify] = useState(true);

  const changed = status !== match.status || accepted.a !== Boolean(match.a.acceptedAt) || accepted.b !== Boolean(match.b.acceptedAt);

  const saveFields = async () => {
    const ok = await onAction({
      action: "update",
      ...(status !== match.status ? { status } : {}),
      accepted: {
        ...(accepted.a !== Boolean(match.a.acceptedAt) ? { a: accepted.a } : {}),
        ...(accepted.b !== Boolean(match.b.acceptedAt) ? { b: accepted.b } : {}),
      },
    });
    if (ok) onDone();
  };

  const replace = async () => {
    if (!replacement) return;
    const ok = await onAction({
      action: "update",
      replace: { side: replaceSide, telegramId: replacement.telegramId },
      notify: Boolean(match.publishedAt) && notify,
    });
    if (ok) onDone();
  };

  return (
    <div className="space-y-4 border-t border-divider pt-3">
      <div className="space-y-2">
        <div className="text-caption font-medium text-foreground">{t("editState")}</div>
        <label className="flex items-center gap-2 text-body">
          <span className="w-28 shrink-0 text-muted-foreground">{t("statusLabel")}</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as MatchStatusId)}
            className="h-9 min-w-0 flex-1 rounded-md border border-divider bg-surface px-2 text-body text-foreground"
          >
            {MATCH_STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`status.${s}`)}
              </option>
            ))}
          </select>
        </label>
        {(["a", "b"] as const).map((s) => (
          <label key={s} className="flex items-center gap-2 text-body text-foreground">
            <Switch checked={accepted[s]} onCheckedChange={(v) => setAccepted({ ...accepted, [s]: v })} />
            {t("acceptedBy", { name: match[s].name })}
          </label>
        ))}
        <Button size="sm" onClick={saveFields} disabled={busy || !changed}>
          {t("save")}
        </Button>
      </div>

      <div className="space-y-2">
        <div className="text-caption font-medium text-foreground">{t("replaceTitle")}</div>
        <div className="flex flex-wrap gap-1.5">
          {(["a", "b"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setReplaceSide(s)}
              className={cn(
                "rounded-full border px-3 py-1 text-chip transition-colors",
                replaceSide === s ? "border-primary bg-primary-muted text-primary" : "border-divider bg-card text-muted-foreground"
              )}
            >
              {t("replaceWho", { name: match[s].name })}
            </button>
          ))}
        </div>
        <UserPicker value={replacement} onChange={setReplacement} />
        {match.publishedAt && (
          <label className="flex items-center gap-2 text-body text-foreground">
            <Switch checked={notify} onCheckedChange={setNotify} />
            {t("notifyBoth")}
          </label>
        )}
        <p className="m-0 text-caption text-muted-foreground">{t(match.publishedAt ? "replaceHint" : "replaceDraftHint")}</p>
        <ConfirmButton size="sm" onConfirm={replace} disabled={busy || !replacement}>
          {t("replace")}
        </ConfirmButton>
      </div>
    </div>
  );
}
