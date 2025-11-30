"use client";

import { useTranslations } from "next-intl";
import { Input, StepContainer } from "@/components";
import { StepProps } from "@/models/types";
import { useWizardContext } from "../WizardContext";
import { Controller } from "react-hook-form";

export interface StepSocialsProps extends StepProps {}

export function StepSocials({ onNext }: StepSocialsProps) {
  const t = useTranslations('profile.steps.instagram');
  const { control, watch } = useWizardContext();
  
  const instagram = watch("instagram") || "";

  return (
    <StepContainer
      title={t('title')}
      onNext={onNext}
      nextDisabled={!instagram.trim()}
    >
      <Controller
        name="instagram"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <Input
            {...field}
            type="text"
            onChange={(e) => {
              // Remove @ symbol if present
              const value = e.target.value.replace(/^@/, "");
              field.onChange(value);
            }}
            placeholder={t('placeholder')}
            required
          />
        )}
      />
    </StepContainer>
  );
}
