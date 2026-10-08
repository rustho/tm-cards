"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { StepProps } from "@/models/types";
import { useWizardContext } from "../WizardContext";

const DOTS = 11;
const TICK_MS = 220;

export interface StepReviewProps extends StepProps {
  /** Calls onNext after this many ms; without it the screen stays until navigated away. */
  autoAdvanceMs?: number;
}

/**
 * Full-screen "Спасибо, {name}! Просматриваем твою анкету…" interstitial with
 * a looping square loader. Optional: not in ONBOARDING_STEPS yet. To use it,
 * add `{ id: "review", component: StepReview, countsInProgress: false,
 * props: { autoAdvanceMs: 3000 } }` to wizardConfig.ts.
 */
export function StepReview({ onNext, autoAdvanceMs }: StepReviewProps) {
  const t = useTranslations("profile.steps.review");
  const { watch } = useWizardContext();
  const name = (watch("name") || "").trim().split(/\s+/)[0];

  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % DOTS), TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!autoAdvanceMs) return;
    const id = window.setTimeout(onNext, autoAdvanceMs);
    return () => window.clearTimeout(id);
  }, [autoAdvanceMs, onNext]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center bg-primary px-8 text-primary-foreground"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <p className="m-0 text-title">{name ? t("title", { name }) : t("titleNoName")}</p>
        <p className="m-0 max-w-[290px] text-option">{t("text")}</p>
      </div>
      <div aria-hidden className="mb-16 flex gap-2">
        {Array.from({ length: DOTS }, (_, i) => (
          <span
            key={i}
            className={cn(
              "size-3 rounded-[2px] border transition-colors duration-150",
              i < active && "border-sky-300 bg-sky-300",
              i === active && "border-white bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.8)]",
              i > active && "border-white bg-transparent"
            )}
          />
        ))}
      </div>
    </div>
  );
}
