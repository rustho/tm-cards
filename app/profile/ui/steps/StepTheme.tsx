"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button, WindowTitleBar } from "@/components/ui";
import { PROFILE_TEMPLATES, getProfileTemplate } from "@/components/profile-templates";
import { StepProps } from "@/models/types";
import { useWizardContext } from "../WizardContext";

/**
 * Final onboarding screen: preview the filled profile in each card template,
 * flip with the arrows, "Выбрать" stores `theme` and finishes the wizard.
 */
export function StepTheme({ onNext }: StepProps) {
  const t = useTranslations("profile.steps.theme");
  const tCard = useTranslations("profileCard.templates");
  const { watch, setValue } = useWizardContext();
  const profile = watch();

  const [index, setIndex] = useState(() =>
    Math.max(0, PROFILE_TEMPLATES.indexOf(getProfileTemplate(profile.theme)))
  );
  const template = PROFILE_TEMPLATES[index];
  const { Component } = template;
  const step = (delta: number) =>
    setIndex((i) => (i + delta + PROFILE_TEMPLATES.length) % PROFILE_TEMPLATES.length);

  const arrowClass = "size-12 shrink-0 border-divider bg-surface text-foreground hover:bg-surface/80 [&_svg]:size-5";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <WindowTitleBar title={t("title")} className="rounded-md" />

      <div
        key={template.id}
        className="min-h-0 flex-1 overflow-y-auto rounded-md border border-divider"
        aria-roledescription="carousel"
        aria-label={tCard(template.id)}
      >
        <Component profile={profile} />
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Button variant="outline" size="icon" className={arrowClass} aria-label={t("prev")} onClick={() => step(-1)}>
          <ArrowLeft aria-hidden />
        </Button>
        <Button
          variant="primary"
          size="block"
          className="flex-1"
          onClick={() => {
            setValue("theme", template.id, { shouldDirty: true });
            onNext();
          }}
        >
          {t("select")}
        </Button>
        <Button variant="outline" size="icon" className={arrowClass} aria-label={t("next")} onClick={() => step(1)}>
          <ArrowRight aria-hidden />
        </Button>
      </div>
    </div>
  );
}
