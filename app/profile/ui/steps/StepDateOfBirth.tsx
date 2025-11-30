"use client";

import { useTranslations } from "next-intl";
import { Input, StepContainer } from "@/components";
import { StepProps, Profile } from "@/models/types";

export interface StepDateOfBirthProps extends StepProps {
  data: Partial<Profile>;
  onUpdate: (data: Partial<Profile>) => void;
}

export function StepDateOfBirth({
  data,
  onNext,
  onUpdate,
}: StepDateOfBirthProps) {
  const t = useTranslations('profile.steps.dateOfBirth');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ dateOfBirth: e.target.value });
  };

  const dateOfBirth = data.dateOfBirth || "";
  const isValid = !!dateOfBirth;

  return (
    <StepContainer
      title={t('title')}
      onNext={onNext}
      nextDisabled={!isValid}
    >
      <Input
        type="date"
        value={dateOfBirth}
        onChange={handleChange}
        required
      />
    </StepContainer>
  );
}
