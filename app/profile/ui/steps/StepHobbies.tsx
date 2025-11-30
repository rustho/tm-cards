"use client";

import {
  SelectedButton,
  SelectionGrid,
  StepContainer,
} from "@/components";
import { HOBBIES, StepProps, Profile } from "@/models/types";

export interface StepHobbiesProps extends StepProps {
  data: Partial<Profile>;
  onUpdate: (data: Partial<Profile>) => void;
}

export function StepHobbies({
  data,
  onUpdate,
  onNext,
}: StepHobbiesProps) {
  const currentHobbies = data.hobbies || [];

  const handleToggleHobby = (hobby: string) => {
    if (currentHobbies.includes(hobby)) {
      onUpdate({ hobbies: currentHobbies.filter((h) => h !== hobby) });
    } else if (currentHobbies.length < 4) {
      onUpdate({ hobbies: [...currentHobbies, hobby] });
    }
  };

  return (
    <StepContainer
      title="Чем заняться?"
      onNext={onNext}
      nextDisabled={currentHobbies.length === 0}
    >
      <SelectionGrid maxSelections={4} currentSelections={currentHobbies.length}>
        {HOBBIES.map((hobby) => (
          <SelectedButton
            key={hobby}
            selected={currentHobbies.includes(hobby)}
            disabled={!currentHobbies.includes(hobby) && currentHobbies.length >= 4}
            onClick={() => handleToggleHobby(hobby)}
          >
            {hobby}
          </SelectedButton>
        ))}
      </SelectionGrid>
    </StepContainer>
  );
}
