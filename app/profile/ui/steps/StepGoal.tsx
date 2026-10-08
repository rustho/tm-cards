"use client";

import { useTranslations } from "next-intl";
import { MeetingGoalCard, SelectionGuidance } from "@/components/ui";
import { GOAL_OPTIONS, MAX_GOALS, StepProps } from "@/models/types";
import { StepWindow } from "../StepWindow";
import { useLimitedSelection } from "../useLimitedSelection";

/** Step 7: what the user wants from meetings, 1 to MAX_GOALS; private (not on the profile). */
export function StepGoal({ onNext }: StepProps) {
  const t = useTranslations("profile.steps.goal");
  const { count, isSelected, isLocked, toggle } = useLimitedSelection("goals", MAX_GOALS);

  return (
    <StepWindow
      title={t("title")}
      onNext={onNext}
      nextDisabled={count === 0}
      nextText={count > 0 ? t("nextWithCount", { count, max: MAX_GOALS }) : undefined}
    >
      <div className="flex flex-col gap-3">
        <SelectionGuidance>{t("guidance", { max: MAX_GOALS })}</SelectionGuidance>
        <p className="m-0 text-center text-body text-text-disabled">{t("privacy")}</p>
        <div className="flex flex-col gap-2">
          {GOAL_OPTIONS.map(({ id, emoji }) => (
            <MeetingGoalCard
              key={id}
              emoji={emoji}
              title={t(`options.${id}.title`)}
              description={t(`options.${id}.description`)}
              selected={isSelected(id)}
              disabled={isLocked(id)}
              onClick={() => toggle(id)}
            />
          ))}
        </div>
      </div>
    </StepWindow>
  );
}
