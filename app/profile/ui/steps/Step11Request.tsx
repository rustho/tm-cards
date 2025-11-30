"use client";

import { useTranslations } from "next-intl";
import { Textarea } from "@telegram-apps/telegram-ui";
import { StepContainer } from "@/components";
import { StepProps } from "@/models/types";
import { useWizardContext } from "../WizardContext";
import { Controller } from "react-hook-form";

export interface Step11RequestProps extends StepProps {}

export function Step11Request({ onNext }: Step11RequestProps) {
  const t = useTranslations('profile.steps.request');
  const { control, watch } = useWizardContext();
  
  const announcement = watch("announcement") || "";

  return (
    <StepContainer
      title={t('title')}
      onNext={onNext}
      nextDisabled={!announcement.trim()}
    >
      <Controller
        name="announcement"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <Textarea
            {...field}
            placeholder={t('placeholder')}
            required
          />
        )}
      />
    </StepContainer>
  );
}
