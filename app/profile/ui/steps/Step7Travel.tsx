"use client";

import { useTranslations } from "next-intl";
import { Input, StepContainer } from "@/components";
import { StepProps } from "@/models/types";
import { useWizardContext } from "../WizardContext";

export interface Step7TravelProps extends StepProps {}

export function Step7Travel({ onNext }: Step7TravelProps) {
  const t = useTranslations('profile.steps.travel');
  const { register, watch } = useWizardContext();
  
  const placesToVisit = watch("placesToVisit") || "";

  return (
    <StepContainer
      title={t('title')}
      onNext={onNext}
      nextDisabled={!placesToVisit.trim()}
    >
      <Input
        {...register("placesToVisit", { required: true })}
        type="text"
        placeholder={t('placeholder')}
        required
      />
    </StepContainer>
  );
}
