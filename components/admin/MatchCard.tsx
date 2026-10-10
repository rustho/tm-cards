"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Badge, ConfirmButton, type BadgeTone } from "@/components/admin/AdminUI";
import type { AdminMatchRow } from "@/models/admin";

const STATUS_TONES: Record<string, BadgeTone> = {
  pending: "primary",
  met: "success",
  not_met: "warning",
  postponed: "neutral",
  expired: "danger",
};

/** One pair: both sides with «Хочу познакомиться» and their feedback; optional cancel. */
export function MatchCard({ match, showWeek = false, onCancel, busy }: { match: AdminMatchRow; showWeek?: boolean; onCancel?: () => void; busy?: boolean }) {
  const t = useTranslations("admin.match");
  const canCancel = onCancel && (match.status === "pending" || match.status === "postponed");

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
    <div className="space-y-2 rounded-md border border-divider bg-card p-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone={STATUS_TONES[match.status] ?? "neutral"}>{t(`status.${match.status}`)}</Badge>
        <span className="text-caption text-muted-foreground">
          {t("score", { score: match.score })}
          {showWeek && ` · ${t("week", { date: match.weekStart })}`}
        </span>
        {canCancel && (
          <ConfirmButton variant="ghost" size="sm" className="ml-auto h-7 px-2 text-destructive" disabled={busy} onConfirm={onCancel}>
            {t("cancel")}
          </ConfirmButton>
        )}
      </div>
      <div className="flex gap-3">
        {side(match.a)}
        {side(match.b)}
      </div>
    </div>
  );
}
