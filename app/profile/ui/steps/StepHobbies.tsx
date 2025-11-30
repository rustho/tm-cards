"use client";

import { useTranslations } from "next-intl";
import {
  SelectedButton,
  SelectionGrid,
  StepContainer,
} from "@/components";
import { HOBBIES, StepProps } from "@/models/types";
import { useWizardContext } from "../WizardContext";

export interface StepHobbiesProps extends StepProps {}

export function StepHobbies({ onNext }: StepHobbiesProps) {
  const t = useTranslations('profile.steps.hobbies');
  const { watch, setValue } = useWizardContext();
  
  const currentHobbies = watch("hobbies") || [];

  const handleToggleHobby = (hobby: string) => {
    if (currentHobbies.includes(hobby)) {
      setValue("hobbies", currentHobbies.filter((h) => h !== hobby), { shouldValidate: true });
    } else if (currentHobbies.length < 4) {
      setValue("hobbies", [...currentHobbies, hobby], { shouldValidate: true });
    }
  };

  const isValidSelection = currentHobbies.length > 0;

  return (
    <StepContainer
      title={t('title')}
      onNext={onNext}
      nextDisabled={!isValidSelection}
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
      {!isValidSelection && (
        <div className="input-error-text">
          {t('error')}
        </div>
      )}
    </StepContainer>
  );
}
