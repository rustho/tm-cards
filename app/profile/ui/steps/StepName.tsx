"use client";

import { useTranslations } from "next-intl";
import { Input, StepContainer } from "@/components";
import { StepProps } from "@/models/types";
import { useWizardContext } from "../WizardContext";

export interface StepNameProps extends StepProps {}

export function StepName({ onNext }: StepNameProps) {
  const t = useTranslations('profile.steps.name');
  const { register, watch, formState: { errors } } = useWizardContext();
  
  const name = watch("name") || "";

  return (
    <StepContainer
      title={t('title')}
      onNext={onNext}
      nextDisabled={!name || name.trim().length < 2}
    >
      <Input
        type="text"
        {...register("name", {
          required: true,
          minLength: {
            value: 2,
            message: t('error')
          }
        })}
        placeholder={t('placeholder')}
        maxLength={50}
        required
      />
      {errors.name && (
        <div className="input-error-text">
          {errors.name.message || t('error')}
        </div>
      )}
    </StepContainer>
  );
}
