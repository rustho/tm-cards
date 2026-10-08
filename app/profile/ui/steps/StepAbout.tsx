"use client";

import { useTranslations } from "next-intl";
import { AnswerExamples, TextArea } from "@/components/ui";
import { StepProps } from "@/models/types";
import { useWizardContext } from "../WizardContext";
import { StepWindow } from "../StepWindow";

/** Matches the server limit for `profiles.about` (lib/profileService.ts). */
const MAX_CHARS = 1000;

/** Step 9: free-form "about me" (UI field `profile`), with prompts for what to write. */
export function StepAbout({ onNext }: StepProps) {
  const t = useTranslations("profile.steps.about");
  const { register, watch } = useWizardContext();

  const about = watch("profile") || "";

  return (
    <StepWindow title={t("title")} onNext={onNext} nextDisabled={!about.trim()}>
      <div className="flex flex-col gap-4">
        <TextArea
          {...register("profile", { required: true, validate: (v) => Boolean(v?.trim()) })}
          maxLength={MAX_CHARS}
          className="min-h-[148px]"
          autoFocus
        />
        <hr className="border-0 border-t border-dashed border-divider" />
        <AnswerExamples heading={t("examplesHeading")} examples={t.raw("examples") as string[]} />
      </div>
    </StepWindow>
  );
}
