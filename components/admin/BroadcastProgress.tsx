"use client";

import { useTranslations } from "next-intl";
import { Badge, type BadgeTone } from "@/components/admin/AdminUI";
import type { BroadcastDto } from "@/models/admin";

const STATUS_TONES: Record<BroadcastDto["status"], BadgeTone> = { sending: "primary", done: "success", cancelled: "neutral" };

/** Status badge, progress bar and delivery counters of a broadcast. */
export function BroadcastProgress({ broadcast }: { broadcast: BroadcastDto }) {
  const t = useTranslations("admin.broadcasts");
  const { counts, total } = broadcast;
  const processed = total - counts.pending;
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-1.5 text-caption text-muted-foreground">
        <Badge tone={STATUS_TONES[broadcast.status]}>{t(`status.${broadcast.status}`)}</Badge>
        <span>{t("counts", { sent: counts.sent, total, blocked: counts.blocked, failed: counts.failed })}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary transition-all" style={{ width: `${total ? Math.round((processed / total) * 100) : 0}%` }} />
      </div>
    </div>
  );
}
