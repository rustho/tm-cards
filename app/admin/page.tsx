"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronRight, Filter, Megaphone, Shuffle, Users } from "lucide-react";
import { useCachedApi } from "@/lib/apiCache";
import { AdminPage, LoadError, Loading, Section, Stat } from "@/components/admin/AdminUI";
import { BotStatus } from "@/components/admin/BotStatus";
import type { AdminOverview } from "@/models/admin";

/** `/admin`: headline numbers and the admin sections. Opened from «Профиль» → «Админ-меню». */
export default function AdminHome() {
  const t = useTranslations("admin");
  const { data, error, refresh } = useCachedApi<AdminOverview>("/api/admin/overview");

  const sections = [
    { href: "/admin/funnel", icon: Filter, title: t("nav.funnel"), description: t("nav.funnelDesc") },
    { href: "/admin/users", icon: Users, title: t("nav.users"), description: t("nav.usersDesc") },
    { href: "/admin/matching", icon: Shuffle, title: t("nav.matching"), description: t("nav.matchingDesc") },
    { href: "/admin/broadcasts", icon: Megaphone, title: t("nav.broadcasts"), description: t("nav.broadcastsDesc") },
  ];

  return (
    <AdminPage title={t("title")}>
      <nav className="divide-y divide-divider overflow-hidden rounded-md border border-divider bg-card">
        {sections.map(({ href, icon: Icon, title, description }) => (
          <Link key={href} href={href} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60">
            <Icon className="size-5 shrink-0 text-primary" />
            <span className="min-w-0 flex-1">
              <span className="block text-counter font-medium text-foreground">{title}</span>
              <span className="block text-caption text-muted-foreground">{description}</span>
            </span>
            <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </nav>

      <Section title={t("bot.title")}>
        <BotStatus />
      </Section>

      {!data ? (
        error ? <LoadError onRetry={refresh} /> : <Loading />
      ) : (
        <>
          <Section title={t("overview.usersTitle")}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              <Stat label={t("overview.total")} value={data.users.total} />
              <Stat label={t("overview.new7d")} value={data.users.new7d} />
              <Stat label={t("overview.active7d")} value={data.users.active7d} />
              <Stat label={t("overview.complete")} value={data.users.complete} />
              <Stat label={t("overview.blocked")} value={data.users.blocked} />
            </div>
          </Section>
          <Section title={t("overview.weekTitle", { date: data.week.weekStart })} aside={<span className="text-caption text-muted-foreground">{t(`phases.${data.week.phase}`)}</span>}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label={t("overview.pairs")} value={data.week.pairs} />
              <Stat label={t("overview.mutual")} value={data.week.mutual} />
              <Stat label={t("overview.met")} value={data.week.met} />
              <Stat label={t("overview.participants")} value={data.week.participants} hint={t("overview.participantsHint")} />
            </div>
          </Section>
        </>
      )}
    </AdminPage>
  );
}
