"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { AccountSettings, Participation, Profile } from "@/models/types";
import { api } from "@/lib/api";
import { updateCache, useCachedApi } from "@/lib/apiCache";
import { formatDayMonth } from "@/lib/dateUtils";
import { openTgLink } from "@/lib/telegramLinks";
import { useAuth } from "@/hooks/useAuth";
import { SUPPORT_TELEGRAM_USERNAME } from "@/config/constants";
import { FooterMenu } from "@/components/FooterMenu";
import { Avatar } from "@/components/ui/avatar";
import { MenuList, MenuRow } from "@/components/ui/menu-list";
import { Switch } from "@/components/ui/switch";

/** Short participation label for the menu row. */
function participationLabel(p: Participation, t: (key: string, values?: Record<string, string>) => string) {
  if (p.option === "active") return p.skipNextRound ? t("values.skipping") : t("values.participating");
  return p.resumeDate ? t("values.pausedUntil", { date: formatDayMonth(p.resumeDate) }) : t("values.paused");
}

/**
 * «Профиль» tab: who I am and my access, then one flat list — questionnaire, location,
 * meetings participation, bot notifications, subscription, how it works, support, admin.
 */
export default function Settings() {
  const t = useTranslations("settings");
  const { user, isAdmin } = useAuth();
  const { data: profile } = useCachedApi<Profile>("/api/profile", { allowNotFound: true });
  const { data: settings } = useCachedApi<AccountSettings>("/api/settings");
  const [notifyError, setNotifyError] = useState(false);

  const name = profile?.name || [user?.first_name, user?.last_name].filter(Boolean).join(" ");
  // Telegram's username is the live one; the profile copy may be stale.
  const username = user?.username || profile?.username;
  const location = profile ? [profile.country, profile.region].filter(Boolean).join(", ") : "";

  const access = settings?.access;
  const accessDate = access?.accessEndsAt ? formatDayMonth(access.accessEndsAt) : "";
  const accessLine = !access
    ? ""
    : !access.hasAccess
      ? t("access.expired")
      : t(access.subscribed ? "access.subscribed" : "access.trial", { date: accessDate });
  // The header already shows the end date; the row only calls to action once access is over.
  const subscriptionValue = access && !access.hasAccess ? t("values.choose") : "";

  const toggleNotifications = async (enabled: boolean) => {
    setNotifyError(false);
    updateCache<AccountSettings>("/api/settings", (s) => ({ ...s, notifications: enabled }));
    try {
      await api.put("/api/settings/notifications", { enabled });
    } catch (error) {
      console.error("Failed to save notification setting:", error);
      updateCache<AccountSettings>("/api/settings", (s) => ({ ...s, notifications: !enabled }));
      setNotifyError(true);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-xl space-y-4 px-4 pb-28 pt-4">
        <h1 className="m-0 text-[28px] font-bold leading-9">{t("title")}</h1>

        <section className="flex items-center gap-4 rounded-md border border-divider bg-card p-4">
          <Avatar name={name || "?"} photo={profile?.photo || user?.photo_url} className="size-16 text-title" />
          <div className="min-w-0 flex-1">
            <p className="m-0 truncate text-title text-foreground">{name}</p>
            {username && <p className="m-0 truncate text-body text-muted-foreground">@{username}</p>}
            {accessLine && (
              <p className={`m-0 mt-1 text-body ${access?.hasAccess ? "text-success" : "text-destructive"}`}>{accessLine}</p>
            )}
          </div>
        </section>

        <MenuList>
          <MenuRow icon="📝" label={t("items.editProfile")} href="/profile/edit" />
          <MenuRow icon="🌏" label={t("items.location")} value={location} href="/profile/edit/location" />
          <MenuRow
            icon="🗓️"
            label={t("items.participation")}
            value={settings ? participationLabel(settings.participation, t) : ""}
            href="/settings/participation"
          />
          <MenuRow
            icon="🔔"
            label={t("items.notifications")}
            trailing={
              <Switch
                aria-label={t("items.notifications")}
                checked={settings?.notifications ?? true}
                disabled={!settings}
                onCheckedChange={toggleNotifications}
              />
            }
          />
          <MenuRow icon="💎" label={t("items.subscription")} value={subscriptionValue} href="/settings/subscription" />
          <MenuRow icon="❓" label={t("items.howItWorks")} href="/settings/how-it-works" />
          <MenuRow
            icon="🎧"
            label={t("items.support")}
            value={`@${SUPPORT_TELEGRAM_USERNAME}`}
            onClick={() => openTgLink(`https://t.me/${SUPPORT_TELEGRAM_USERNAME}`)}
          />
          {/* UI gate only; admin API routes re-check with requireAdmin(). */}
          {isAdmin && <MenuRow icon="🧭" label={t("items.admin")} href="/admin" />}
        </MenuList>

        {notifyError && <p className="m-0 text-body text-destructive">{t("notificationsFailed")}</p>}
      </div>
      <FooterMenu />
    </div>
  );
}
