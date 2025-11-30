"use client";

import { useTranslations } from "next-intl";
import {
  SelectedButton,
  SelectionGrid,
  StepContainer,
} from "@/components";
import { PERSONALITY_TRAITS, StepProps } from "@/models/types";
import { useWizardContext } from "../WizardContext";

export interface StepPersonalityProps extends StepProps {}

export function StepPersonality({ onNext }: StepPersonalityProps) {
  const t = useTranslations('profile.steps.personality');
  const { watch, setValue } = useWizardContext();
  
  const currentTraits = watch("personalityTraits") || [];

  const handleToggleTrait = (trait: string) => {
    if (currentTraits.includes(trait)) {
      setValue("personalityTraits", currentTraits.filter((t) => t !== trait), { shouldValidate: true });
    } else {
      if (currentTraits.length < 4) {
        setValue("personalityTraits", [...currentTraits, trait], { shouldValidate: true });
      }
    }
  };

  const isValidSelection = currentTraits.length > 0;

  return (
    <StepContainer
      title={t('title')}
      onNext={onNext}
      nextDisabled={!isValidSelection}
    >
      <SelectionGrid maxSelections={4} currentSelections={currentTraits.length}>
        {PERSONALITY_TRAITS.map((trait) => (
          <SelectedButton
            key={trait}
            selected={currentTraits.includes(trait)}
            disabled={!currentTraits.includes(trait) && currentTraits.length >= 4}
            onClick={() => handleToggleTrait(trait)}
          >
            {trait}
          </SelectedButton>
        ))}
      </SelectionGrid>
      {!isValidSelection && (
        <div className="input-error-text">
          {t('error')}
        </div>
      )}
    </StepContainer>
  );
}
