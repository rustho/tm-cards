"use client";

import { useTranslations } from "next-intl";
import { Input, StepContainer } from "@/components";
import { StepProps, Profile } from "@/models/types";

export interface Step9InstagramProps extends StepProps {
  data: Profile["instagram"];
  onUpdate: (instagram: string) => void;
}

export function Step9Instagram({
  data,
  onUpdate,
  onNext,
  onBack,
}: Step9InstagramProps) {
  const t = useTranslations('profile.steps.instagram');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove @ symbol if present
    const value = e.target.value.replace(/^@/, "");
    onUpdate(value);
  };

  return (
    <StepContainer
      title={t('title')}
      description={t('description')}
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!data.trim()}
    >
      <Input
        type="text"
        value={data}
        onChange={handleChange}
        placeholder={t('placeholder')}
        required
      />
    </StepContainer>
  );
}
