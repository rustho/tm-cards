"use client";

import { useTranslations } from "next-intl";
import { StepContainer, SelectionCard } from "@/components";
import { GOALS, StepProps, Goal } from "@/models/types";
import { useWizardContext } from "../WizardContext";
import { Controller } from "react-hook-form";

export interface StepGoalProps extends StepProps {}

export function StepGoal({ onNext }: StepGoalProps) {
  const t = useTranslations('profile.steps.goal');
  const { control, watch } = useWizardContext();
  
  const currentGoal = watch("goal") || "";

  return (
    <StepContainer
      title={t('title')}
      onNext={onNext}
      nextDisabled={!currentGoal}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
        <Controller
          name="goal"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <>
              {GOALS.map((goal) => (
                <SelectionCard
                  key={goal}
                  state={field.value === goal ? "selected" : "default"}
                  type="big card"
                  text={goal}
                  showImage={false}
                  showEmoji={false}
                  showDescription={false}
                  onClick={() => field.onChange(goal)}
                />
              ))}
            </>
          )}
        />
      </div>
    </StepContainer>
  );
}
