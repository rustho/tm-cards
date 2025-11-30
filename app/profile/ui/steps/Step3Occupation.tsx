//@ts-nocheck
"use client";
import { useTranslations } from "next-intl";
import { Input, StepContainer } from "@/components";
import { StepProps } from "@/models/types";
import { useWizardContext } from "../WizardContext";

export interface Step3OccupationProps extends StepProps {}

export function Step3Occupation({ onNext }: Step3OccupationProps) {
  const t = useTranslations("profile.steps.occupation");
  const {
    register,
    watch,
    formState: { errors },
  } = useWizardContext();

  const occupation = watch("occupation") || "";
  const isValidOccupation = occupation.trim().length >= 2;

  return (
    <StepContainer
      title={t("title")}
      onNext={onNext}
      nextDisabled={!isValidOccupation}
    >
      <Input
        {...register("occupation", {
          required: true,
          minLength: {
            value: 2,
            message: t("error"),
          },
        })}
        type="text"
        placeholder={t("placeholder")}
        maxLength={50}
        required
      />
      {errors.occupation && (
        <div className="input-error-text">
          {errors.occupation.message || t("error")}
        </div>
      )}
    </StepContainer>
  );
}
