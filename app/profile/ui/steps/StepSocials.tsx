"use client";

import { useTranslations } from "next-intl";
import { Input, StepContainer } from "@/components";
import { StepProps, Profile } from "@/models/types";

export interface StepSocialsProps extends StepProps {
  data: Partial<Profile>;
  onUpdate: (data: Partial<Profile>) => void;
}

export function StepSocials({
  data,
  onNext,
  onUpdate,
}: StepSocialsProps) {
  const t = useTranslations('profile.steps.instagram');
  const instagram = data.instagram || "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove @ symbol if present
    const value = e.target.value.replace(/^@/, "");
    onUpdate({ instagram: value });
  };

  return (
    <StepContainer
      title={t('title')}
      onNext={onNext}
      nextDisabled={!instagram.trim()}
    >
      <Input
        type="text"
        value={instagram}
        onChange={handleChange}
        placeholder={t('placeholder')}
        required
      />
    </StepContainer>
  );
}
