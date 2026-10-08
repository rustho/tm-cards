"use client";

import { useTranslations } from "next-intl";
import { AgeSummary, TextInput } from "@/components/ui";
import { StepProps } from "@/models/types";
import { validateDateOfBirth, calculateAge, formatDateForInput } from "@/lib/dateUtils";
import { useWizardContext } from "../WizardContext";
import { StepWindow } from "../StepWindow";

/** Accepted range: 18–100 years old, as YYYY-MM-DD bounds for the native picker. */
function yearsAgo(years: number) {
  const today = new Date();
  return formatDateForInput(
    new Date(Date.UTC(today.getFullYear() - years, today.getMonth(), today.getDate())).toISOString()
  );
}

/** Step 3: date of birth via the native date input; shows the resulting age. */
export function StepDateOfBirth({ onNext }: StepProps) {
  const t = useTranslations("profile.steps.dateOfBirth");
  const { register, watch, formState: { errors } } = useWizardContext();

  const dateOfBirth = watch("dateOfBirth") || "";
  const isValidDate = Boolean(dateOfBirth) && validateDateOfBirth(dateOfBirth).isValid;
  const age = isValidDate ? calculateAge(dateOfBirth) : null;

  return (
    <StepWindow
      title={t("title")}
      onNext={onNext}
      nextDisabled={!isValidDate}
      bodyClassName="flex flex-col justify-between gap-6"
    >
      <div className="flex flex-col gap-2">
        <TextInput
          type="date"
          {...register("dateOfBirth", {
            required: true,
            validate: (value) => {
              if (!value || !validateDateOfBirth(value).isValid) {
                if (!value || Number.isNaN(Date.parse(value))) return t("error.invalid");
                return calculateAge(value) < 18 ? t("error.minAge") : t("error.maxAge");
              }
              return true;
            },
          })}
          aria-label={t("placeholder")}
          min={yearsAgo(100)}
          max={yearsAgo(18)}
          error={Boolean(errors.dateOfBirth)}
          className="appearance-none text-left"
        />
        {errors.dateOfBirth && (
          <p className="m-0 px-1 text-caption text-destructive">{errors.dateOfBirth.message}</p>
        )}
      </div>

      <AgeSummary
        age={age !== null ? t("ageSummary", { age }) : " "}
        hint={t("ageHint")}
      />
    </StepWindow>
  );
}
