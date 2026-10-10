"use client";

import { useTranslations } from "next-intl";
import { TRIAL_DAYS, WEEK_SCHEDULE } from "@/config/constants";
import { BackButton } from "@/components/ui/back-button";

const STEPS = [
  { key: "profile", icon: "📝" },
  { key: "match", icon: "🤝" },
  { key: "agree", icon: "👋" },
  { key: "feedback", icon: "💬" },
  { key: "signup", icon: "✅" },
  { key: "access", icon: "💎" },
] as const;

/** «Как работает приложение»: the weekly cycle in six steps; days come from WEEK_SCHEDULE. */
export default function HowItWorks() {
  const t = useTranslations("settings.howItWorks");
  const values = {
    agree: { day: String(WEEK_SCHEDULE.agreeDeadline.day) },
    signup: { day: String(WEEK_SCHEDULE.signupStart.day) },
    access: { trialDays: TRIAL_DAYS },
  } as Record<string, Record<string, string | number>>;

  return (
    <div className="mx-auto min-h-screen max-w-xl space-y-4 px-4 pb-12 pt-4">
      <BackButton />
      <h1 className="m-0 text-[28px] font-bold leading-9">{t("title")}</h1>

      <ol className="m-0 list-none space-y-3 p-0">
        {STEPS.map(({ key, icon }) => (
          <li key={key} className="flex gap-3 rounded-md border border-divider bg-card p-4">
            <span className="flex size-7 shrink-0 items-center justify-center text-[24px] leading-none" aria-hidden>
              {icon}
            </span>
            <div className="min-w-0 space-y-1">
              <h2 className="m-0 text-option font-semibold">{t(`steps.${key}.title`)}</h2>
              <p className="m-0 text-body text-muted-foreground">{t(`steps.${key}.text`, values[key])}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
