"use client";

import { useTranslations } from "next-intl";
import {
  SelectedButton,
  SelectionGrid,
  StepContainer,
} from "@/components";
import { INTERESTS, StepProps } from "@/models/types";
import { useWizardContext } from "../WizardContext";

export interface StepInterestsProps extends StepProps {}

export function StepInterests({ onNext }: StepInterestsProps) {
  const t = useTranslations('profile.steps.interests');
  const { watch, setValue } = useWizardContext();
  
  const currentInterests = watch("interests") || [];

  const handleToggleInterest = (interest: string) => {
    if (currentInterests.includes(interest)) {
      setValue("interests", currentInterests.filter((i) => i !== interest), { shouldValidate: true });
    } else {
      if (currentInterests.length < 4) {
        setValue("interests", [...currentInterests, interest], { shouldValidate: true });
      }
    }
  };

  const isValidSelection = currentInterests.length > 0;

  return (
    <StepContainer
      title={t('title')}
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
