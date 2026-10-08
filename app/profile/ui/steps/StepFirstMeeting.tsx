"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { StepProps } from "@/models/types";
import { useWizardContext } from "../WizardContext";

/**
 * Last onboarding screen (full-screen, no progress header): explains the free
 * first meeting and asks whether to join this week's matching round. The
 * answer goes out with the final save as `skipNextRound`.
 */
export function StepFirstMeeting({ onNext }: StepProps) {
  const t = useTranslations("profile.steps.firstMeeting");
  const { setValue } = useWizardContext();

  const answer = (joinThisWeek: boolean) => {
    setValue("skipNextRound", !joinThisWeek, { shouldDirty: true });
    onNext();
  };

  const optionClass =
    "flex h-14 w-full items-center gap-5 rounded-md border border-primary px-6 text-left text-[20px] font-bold leading-6 text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-background px-4"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-8 py-10">
        <h1 className="m-0 whitespace-pre-line text-center text-[28px] font-bold leading-[34px] text-foreground">
          {t("title")}
        </h1>
        <div className="flex flex-col gap-5 text-body text-muted-foreground">
          <p className="m-0">{t("trial")}</p>
          <p className="m-0">{t("noBurn")}</p>
        </div>
        <div className="flex flex-col gap-4">
          <p className="m-0 text-center text-option font-bold text-foreground">{t("question")}</p>
          <button type="button" className={cn(optionClass, "bg-primary-muted")} onClick={() => answer(true)}>
            <span aria-hidden className="text-[24px]">✨</span>
            {t("yes")}
          </button>
          <button type="button" className={cn(optionClass, "bg-surface")} onClick={() => answer(false)}>
            <span aria-hidden className="text-[24px]">⏳</span>
            {t("no")}
          </button>
        </div>
      </div>
    </div>
  );
}
