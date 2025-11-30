"use client";

import { useTranslations } from "next-intl";
import { Input, StepContainer } from "@/components";
import { StepProps } from "@/models/types";
import {
  validateDateOfBirth,
  calculateAge,
  formatDateForInput,
} from "@/lib/dateUtils";
import { useWizardContext } from "../WizardContext";

export interface StepDateOfBirthProps extends StepProps {}

export function StepDateOfBirth({ onNext }: StepDateOfBirthProps) {
  const t = useTranslations("profile.steps.dateOfBirth");
  const {
    register,
    watch,
    formState: { errors },
  } = useWizardContext();

  const dateOfBirth = watch("dateOfBirth") || "";
  const validation = dateOfBirth
    ? validateDateOfBirth(dateOfBirth)
    : { isValid: false };
  const isValidDate = validation.isValid;

  // Calculate and display current age if valid date
  const displayAge =
    dateOfBirth && isValidDate ? calculateAge(dateOfBirth) : null;

  // Set max date to 18 years ago from today
  const today = new Date();
  const maxDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  );
  const maxDateString = formatDateForInput(maxDate.toISOString());

  // Set min date to 100 years ago from today
  const minDate = new Date(
    today.getFullYear() - 100,
    today.getMonth(),
    today.getDate()
  );
  const minDateString = formatDateForInput(minDate.toISOString());

  return (
    <StepContainer
      title={t("title")}
      onNext={onNext}
      nextDisabled={!isValidDate}
    >
      <Input
        type="date"
        {...register("dateOfBirth", {
          required: true,
          validate: (value) => {
            if (!value) return t("error.invalid");
            const validation = validateDateOfBirth(value);
            if (!validation.isValid) {
              return validation.errorMessage ===
                "You must be at least 18 years old"
                ? t("error.minAge")
                : validation.errorMessage === "Age cannot exceed 100 years"
                ? t("error.maxAge")
                : t("error.invalid");
            }
            return true;
          },
        })}
        placeholder={t("placeholder")}
        min={minDateString}
        max={maxDateString}
        required
      />

      {displayAge && (
        <div className="age-display">
          {t("ageDisplay", { age: displayAge })}
        </div>
      )}

      {errors.dateOfBirth && (
        <div className="input-error-text">{errors.dateOfBirth.message}</div>
      )}
    </StepContainer>
  );
}
