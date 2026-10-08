"use client";

import { useTranslations } from "next-intl";
import { AnswerExamples, TextArea } from "@/components/ui";
import { StepProps } from "@/models/types";
import { useWizardContext } from "../WizardContext";
import { StepWindow } from "../StepWindow";

const MAX_CHARS = 80;

/** Step 4: what the user does now (work, studies, own project), with answer examples. */
export function StepOccupation({ onNext }: StepProps) {
  const t = useTranslations("profile.steps.occupation");
  const { register, watch } = useWizardContext();

  const occupation = watch("occupation") || "";

  return (
    <StepWindow title={t("title")} onNext={onNext} nextDisabled={!occupation.trim()}>
      <div className="flex flex-col gap-4">
        <TextArea
          {...register("occupation", { required: true, validate: (v) => Boolean(v?.trim()) })}
          placeholder={t("placeholder")}
          maxLength={MAX_CHARS}
          enterKeyHint="next"
          autoFocus
        />
        <hr className="border-0 border-t border-dashed border-divider" />
        <AnswerExamples heading={t("examplesHeading")} examples={t.raw("examples") as string[]} />
      </div>
    </StepWindow>
  );
}
