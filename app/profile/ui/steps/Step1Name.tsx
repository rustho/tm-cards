"use client";

import { useTranslations } from "next-intl";
import { Input, StepContainer } from "../../../../components";
import { StepProps, Profile } from "@/models/types";

export interface Step1NameProps extends StepProps {
  data: Profile["name"];
  onUpdate: (name: string) => void;
}

export function Step1Name({ data, onUpdate, onNext, onBack }: Step1NameProps) {
  const t = useTranslations('profile.steps.name');
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(e.target.value);
  };

  const isValidName = data.trim().length >= 2;

  return (
    <StepContainer
      title={t('title')}
      description={t('description')}
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!isValidName}
    >
      <Input
        type="text"
        value={data}
        onChange={handleNameChange}
        placeholder={t('placeholder')}
        maxLength={50}
        required
      />
      {data && !isValidName && (
        <div className="input-error-text">
          {t('error')}
        </div>
      )}
    </StepContainer>
  );
}
