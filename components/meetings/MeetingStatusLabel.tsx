"use client";

import { useTranslations } from "next-intl";
import type { MeetingStatus } from "@/models/types";
import { cn } from "@/lib/utils";

const STATUS_COLOR: Record<MeetingStatus, string> = {
  pending: "text-primary",
  met: "text-success",
  not_met: "text-destructive",
  postponed: "text-warning",
};

/** Colored status line under a partner's name. */
export const MeetingStatusLabel = ({ status, className }: { status: MeetingStatus; className?: string }) => {
  const t = useTranslations("meetings.status");
  return <p className={cn("m-0 text-body", STATUS_COLOR[status], className)}>{t(status)}</p>;
};
