"use client";

import { useLocale, useTranslations } from "next-intl";
import { Badge, formatDate } from "@/components/admin/AdminUI";
import type { AdminUserRow } from "@/models/admin";

/** Profile / access / bot / status badges of a user (list rows and the user card). */
export function UserBadges({ user }: { user: AdminUserRow }) {
  const t = useTranslations("admin.users");
  const locale = useLocale();
  const until = formatDate(user.access.endsAt, locale);
  return (
    <span className="flex flex-wrap gap-1">
      <Badge tone={user.profile === "complete" ? "success" : user.profile === "draft" ? "warning" : "neutral"}>
        {t(`profile.${user.profile}`)}
      </Badge>
      <Badge tone={user.access.kind === "subscription" ? "primary" : user.access.kind === "trial" ? "neutral" : "danger"}>
        {user.access.kind === "none" ? t("access.none") : t(`access.${user.access.kind}`, { date: until })}
      </Badge>
      {user.botBlocked && <Badge tone="danger">{t("botBlocked")}</Badge>}
      {user.status !== "active" && <Badge tone="danger">{t(`status.${user.status}`)}</Badge>}
    </span>
  );
}
