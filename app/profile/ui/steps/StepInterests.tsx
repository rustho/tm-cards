"use client";

import { useTranslations } from "next-intl";
import {
  SelectedButton,
  SelectionGrid,
  StepContainer,
} from "@/components";
import { INTERESTS, StepProps, Profile } from "@/models/types";

export interface StepInterestsProps extends StepProps {
  data: Partial<Profile>;
  onUpdate: (data: Partial<Profile>) => void;
}

export function StepInterests({
  data,
  onUpdate,
  onNext,
}: StepInterestsProps) {
  const t = useTranslations('profile.steps.interests');
  const currentInterests = data.interests || [];

  const handleToggleInterest = (interest: string) => {
    if (currentInterests.includes(interest)) {
      onUpdate({ interests: currentInterests.filter((i) => i !== interest) });
    } else {
       if (currentInterests.length < 4) {
          onUpdate({ interests: [...currentInterests, interest] });
       }
    }
  };

  const isValidSelection = currentInterests.length > 0;

  return (
    <StepContainer
      title="О чем говорить?"
      onNext={onNext}
      nextDisabled={!isValidSelection}
    >
      <SelectionGrid maxSelections={4} currentSelections={currentInterests.length}>
        {INTERESTS.map((interest) => (
          <SelectedButton
            key={interest}
            selected={currentInterests.includes(interest)}
            disabled={!currentInterests.includes(interest) && currentInterests.length >= 4}
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
