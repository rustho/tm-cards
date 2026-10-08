"use client";

import { useTranslations } from "next-intl";
import { TextInput } from "@/components/ui";
import { StepProps } from "@/models/types";
import { useWizardContext } from "../WizardContext";
import { StepWindow } from "../StepWindow";

/** Step 2: the name shown on the profile (prefilled from Telegram). */
export function StepName({ onNext }: StepProps) {
  const t = useTranslations("profile.steps.name");
  const { register, watch, formState: { errors } } = useWizardContext();

  const name = watch("name") || "";
  const valid = name.trim().length >= 2;

  return (
    <StepWindow title={t("title")} onNext={onNext} nextDisabled={!valid}>
      <form
        className="flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (valid) onNext();
        }}
      >
        <TextInput
          {...register("name", {
            required: true,
            validate: (value) => (value ?? "").trim().length >= 2 || t("error"),
          })}
          placeholder={t("placeholder")}
          maxLength={50}
          autoComplete="given-name"
          enterKeyHint="next"
          autoFocus
          error={Boolean(errors.name)}
        />
        {errors.name && (
          <p className="m-0 px-1 text-caption text-destructive">{errors.name.message || t("error")}</p>
        )}
      </form>
    </StepWindow>
  );
}
