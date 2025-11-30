"use client";

import {
  SelectedButton,
  SelectionGrid,
  StepContainer,
} from "@/components";
import { GOALS, StepProps, Profile, Goal } from "@/models/types";

export interface StepGoalProps extends StepProps {
  data: Partial<Profile>;
  onUpdate: (data: Partial<Profile>) => void;
}

export function StepGoal({
  data,
  onUpdate,
  onNext,
}: StepGoalProps) {
  const currentGoal = data.goal || "";

  const handleSelectGoal = (goal: Goal) => {
    onUpdate({ goal });
  };

  return (
    <StepContainer
      title="Для чего ты здесь?"
      onNext={onNext}
      nextDisabled={!currentGoal}
    >
      <SelectionGrid maxSelections={1} currentSelections={currentGoal ? 1 : 0}>
        {GOALS.map((goal) => (
          <SelectedButton
            key={goal}
            selected={currentGoal === goal}
            onClick={() => handleSelectGoal(goal)}
          >
            {goal}
          </SelectedButton>
        ))}
      </SelectionGrid>
    </StepContainer>
  );
}
