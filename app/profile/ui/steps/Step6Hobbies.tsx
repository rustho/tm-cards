"use client";

import { SelectedButton, SelectionGrid, StepContainer } from "@/components";
import { StepProps, ProfileData, HOBBIES } from "@/models/types";

export interface Step6HobbiesProps extends StepProps {
  data: ProfileData["hobbies"];
  onUpdate: (hobbies: string[]) => void;
}

export function Step6Hobbies({
  data,
  onUpdate,
  onNext,
  onBack,
}: Step6HobbiesProps) {
  const handleToggleHobby = (hobby: string) => {
    if (data.includes(hobby)) {
      onUpdate(data.filter((h) => h !== hobby));
    } else if (data.length < 4) {
      onUpdate([...data, hobby]);
    }
  };

  return (
    <StepContainer
      title="Твои самые любимые увлечения или чем тебе хочется заняться вместе?"
      description="Выберите максимум 4 увлечения"
      onBack={onBack}
      onNext={onNext}
      nextDisabled={data.length === 0}
    >
      <SelectionGrid maxSelections={4} currentSelections={data.length}>
        {HOBBIES.map((hobby) => (
          <SelectedButton
            key={hobby}
            selected={data.includes(hobby)}
            disabled={!data.includes(hobby) && data.length >= 4}
            onClick={() => handleToggleHobby(hobby)}
          >
            {hobby}
          </SelectedButton>
        ))}
      </SelectionGrid>
    </StepContainer>
  );
}
