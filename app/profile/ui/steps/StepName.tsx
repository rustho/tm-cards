"use client";

import { useTranslations } from "next-intl";
import { Input, StepContainer } from "@/components";
import { StepProps, Profile } from "@/models/types";

export interface StepNameProps extends StepProps {
  data: Partial<Profile>;
  onUpdate: (data: Partial<Profile>) => void;
}

export function StepName({
  data,
  onNext,
  onUpdate,
}: StepNameProps) {
  const t = useTranslations('profile.steps.name');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ name: e.target.value });
  };

  const name = data.name || "";

  return (
    <StepContainer
      title={t('title')}
      onNext={onNext}
      nextDisabled={!name.trim()}
    >
      <Input
        type="text"
        value={name}
        onChange={handleChange}
        placeholder={t('placeholder')}
        required
      />
    </StepContainer>
  );
}
