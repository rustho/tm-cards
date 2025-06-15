"use client";

import { useTranslations } from "next-intl";
import { Textarea } from "@telegram-apps/telegram-ui";
import { StepContainer } from "@/components";
import { Profile, StepProps } from "@/models/types";

interface Step11RequestProps extends StepProps {
  data: Profile["announcement"];
  onUpdate: (announcement: Profile["announcement"]) => void;
}

export function Step11Request({
  data,
  onUpdate,
  onNext,
  onBack,
}: Step11RequestProps) {
  const t = useTranslations('profile.steps.request');

  return (
    <StepContainer
      title={t('title')}
      description={t('description')}
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!data.trim()}
    >
      <Textarea
        value={data}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder={t('placeholder')}
        required
      />
    </StepContainer>
  );
}
