"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { AccountSettings } from "@/models/types";
import { cn } from "@/lib/utils";

const FEATURES = [
  { id: "weekly", icon: "👥" },
  { id: "hours", icon: "⏱️" },
  { id: "matching", icon: "🔎" },
  { id: "question", icon: "❓" },
] as const;

/**
 * «Подписка N.People»: blue title bar with the access status pill, then what the subscription
 * gives on a light-blue body. The whole card opens /settings/subscription.
 */
export const SubscriptionCard = ({ access }: { access?: AccountSettings["access"] }) => {
  const t = useTranslations("settings.subscriptionCard");
  const status = !access ? null : !access.hasAccess ? "expired" : access.subscribed ? "active" : "trial";

  return (
    <Link
      href="/settings/subscription"
      className="block overflow-hidden rounded-[12px] border border-primary-light/60 transition-opacity hover:opacity-95"
    >
      <div className="flex items-center justify-between gap-3 bg-primary px-4 py-3">
        <h2 className="m-0 text-title text-primary-foreground">{t("title")}</h2>
        {status && (
          <span
            className={cn(
              "shrink-0 rounded-full bg-card px-4 py-1 text-chip font-bold",
              status === "expired" ? "text-destructive" : "text-primary"
            )}
          >
            {t(`status.${status}`)}
          </span>
        )}
      </div>
      <ul className="m-0 list-none divide-y divide-card/60 bg-primary-light/40 px-4 py-1">
        {FEATURES.map(({ id, icon }) => (
          <li key={id} className="flex min-h-14 items-center gap-3 py-2 text-option text-foreground">
            <span className="flex size-8 shrink-0 items-center justify-center text-[24px] leading-none" aria-hidden>
              {icon}
            </span>
            {t(`features.${id}`)}
          </li>
        ))}
      </ul>
    </Link>
  );
};
