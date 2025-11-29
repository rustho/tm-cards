"use client";

import {
  SelectedButton,
  SelectionGrid,
  StepContainer,
} from "../../../../components";
import { PERSONALITY_TRAITS, StepProps, ProfileData } from "@/models/types";

// Step 4: Personality
export interface Step4PersonalityProps extends StepProps {
  data: ProfileData["personalityTraits"];
  onUpdate: (personality: string[]) => void;
}

export function Step4Personality({
  data,
  onUpdate,
  onNext,
}: Step4PersonalityProps) {
  const handleToggleTrait = (trait: string) => {
    if (data.includes(trait)) {
      onUpdate(data.filter((t) => t !== trait));
    } else {
      onUpdate([...data, trait]);
    }
  };

  const isValidSelection = data.length > 0;

  return (
    <StepContainer
      title="Какие у тебя черты характера?"
      onNext={onNext}
      nextDisabled={!isValidSelection}
    >
      <SelectionGrid maxSelections={4} currentSelections={data.length}>
        {PERSONALITY_TRAITS.map((trait) => (
          <SelectedButton
            key={trait}
            selected={data.includes(trait)}
            disabled={!data.includes(trait) && data.length >= 4}
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
