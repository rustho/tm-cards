"use client";

import { useTranslations } from "next-intl";
import { Input, StepContainer } from "@/components";
import { StepProps } from "@/models/types";
import { useWizardContext } from "../WizardContext";
import { Controller } from "react-hook-form";

const MAX_CHARS = 284;

export interface StepAboutProps extends StepProps {}

export function StepAbout({ onNext }: StepAboutProps) {
  const t = useTranslations('profile.steps.about');
  const { control, watch } = useWizardContext();
  
  const about = watch("profile") || "";

  return (
    <StepContainer
      title={t('title')}
      onNext={onNext}
      nextDisabled={!about.trim()}
    >
      <Controller
        name="profile"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <Input
            {...field}
            type="text"
            onChange={(e) => {
              const value = e.target.value.slice(0, MAX_CHARS);
              field.onChange(value);
            }}
            placeholder={t('placeholder')}
            maxLength={MAX_CHARS}
            required
          />
        )}
      />
      <div className="character-count">
        {about.length}/{MAX_CHARS}
      </div>
    </StepContainer>
  );
}
