"use client";

import {
  SelectedButton,
  SelectionGrid,
  StepContainer,
} from "@/components";
import { PERSONALITY_TRAITS, StepProps, Profile } from "@/models/types";

export interface StepPersonalityProps extends StepProps {
  data: Partial<Profile>;
  onUpdate: (data: Partial<Profile>) => void;
}

export function StepPersonality({
  data,
  onUpdate,
  onNext,
}: StepPersonalityProps) {
  const currentTraits = data.personalityTraits || [];

  const handleToggleTrait = (trait: string) => {
    if (currentTraits.includes(trait)) {
      onUpdate({ personalityTraits: currentTraits.filter((t) => t !== trait) });
    } else {
      if (currentTraits.length < 4) {
          onUpdate({ personalityTraits: [...currentTraits, trait] });
      }
    }
  };

  const isValidSelection = currentTraits.length > 0;

  return (
    <StepContainer
      title="Какой ты человек?"
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
          Выберите хотя бы одну черту характера
        </div>
      )}
    </StepContainer>
  );
}
