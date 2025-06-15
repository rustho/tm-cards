"use client";

import { useTranslations } from "next-intl";
import {
  SelectedButton,
  SelectionGrid,
  StepContainer,
} from "../../../../components";
import { INTERESTS, StepProps, Profile } from "@/models/types";

// Step 5: Interests
export interface Step5InterestsProps extends StepProps {
  data: Profile["interests"];
  onUpdate: (interests: string[]) => void;
}

export function Step5Interests({
  data,
  onUpdate,
  onNext,
  onBack,
}: Step5InterestsProps) {
  const t = useTranslations('profile.steps.interests');
  
  const handleToggleInterest = (interest: string) => {
    if (data.includes(interest)) {
      onUpdate(data.filter((i) => i !== interest));
    } else {
      onUpdate([...data, interest]);
    }
  };

  const isValidSelection = data.length > 0;

  return (
    <StepContainer
      title={t('title')}
      description={t('description')}
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!isValidSelection}
    >
      <SelectionGrid maxSelections={4} currentSelections={data.length}>
        {INTERESTS.map((interest) => (
          <SelectedButton
            key={interest}
            selected={data.includes(interest)}
            disabled={!data.includes(interest) && data.length >= 4}
            onClick={() => handleToggleInterest(interest)}
          >
            {interest}
          </SelectedButton>
        ))}
      </SelectionGrid>
      {!isValidSelection && (
        <div className="input-error-text">{t('error')}</div>
      )}
    </StepContainer>
  );
}
