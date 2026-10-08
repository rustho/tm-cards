"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { BottomAction } from "@/components/meetings/BottomAction";

/** Mock tariffs until Telegram Stars payments land (`plans` / `subscriptions` / `payments` have no API yet). */
const MOCK_PLANS = [
  { id: "month", weeks: 4, stars: 250 },
  { id: "quarter", weeks: 12, stars: 600 },
] as const;

/** Subscription picker (mock): choose a plan; payment is not wired yet. */
export default function Subscription() {
  const t = useTranslations("settings.subscription");
  const [plan, setPlan] = useState<(typeof MOCK_PLANS)[number]["id"]>("month");

  return (
    <div className="mx-auto min-h-screen max-w-xl space-y-6 px-4 pb-32 pt-4">
      <BackButton />
      <div className="space-y-2">
        <h1 className="m-0 text-[28px] font-bold leading-9">{t("title")}</h1>
        <p className="m-0 text-body text-muted-foreground">{t("subtitle")}</p>
      </div>

      <ul className="m-0 list-none space-y-2 p-0">
        {[t("features.meetings"), t("features.feedback"), t("features.invites")].map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-counter">
            <Check className="size-5 shrink-0 text-success" aria-hidden />
            {feature}
          </li>
        ))}
      </ul>

      <div className="space-y-3">
        {MOCK_PLANS.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={plan === p.id}
            onClick={() => setPlan(p.id)}
            className={cn(
              "flex w-full items-center justify-between rounded-md border p-4 text-left transition-colors",
              plan === p.id ? "border-primary bg-primary-muted" : "border-divider bg-card"
            )}
          >
            <span>
              <span className="block text-option font-semibold">{t(`plans.${p.id}`)}</span>
              <span className="block text-body text-muted-foreground">{t("weeks", { count: p.weeks })}</span>
            </span>
            <span className="text-option font-semibold">{p.stars} ⭐</span>
          </button>
        ))}
      </div>

      <BottomAction>
        <p className="m-0 pb-2 text-center text-body text-muted-foreground">{t("comingSoon")}</p>
        <Button variant="primary" size="block" disabled>
          {t("pay")}
        </Button>
      </BottomAction>
    </div>
  );
}
