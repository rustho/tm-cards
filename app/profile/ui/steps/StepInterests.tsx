"use client";

import { useTranslations } from "next-intl";
import { CategoryHeader, InterestChip, SelectionGuidance } from "@/components/ui";
import { INTEREST_GROUPS, MAX_INTERESTS, MIN_INTERESTS, StepProps } from "@/models/types";
import { StepWindow } from "../StepWindow";
import { useLimitedSelection } from "../useLimitedSelection";

/** Step 6: interests and hobbies as grouped chips, MIN–MAX; the rest lock at the limit. */
export function StepInterests({ onNext }: StepProps) {
  const t = useTranslations("profile.steps.interests");
  const { count, isSelected, isLocked, toggle } = useLimitedSelection("interests", MAX_INTERESTS);

  return (
    <StepWindow title={t("title")} onNext={onNext} nextDisabled={count < MIN_INTERESTS}>
      <div className="flex flex-col gap-6">
        <SelectionGuidance>{t("guidance", { min: MIN_INTERESTS, max: MAX_INTERESTS })}</SelectionGuidance>
        {INTEREST_GROUPS.map((group) => (
          <section key={group.title} className="flex flex-col gap-3">
            <CategoryHeader title={group.title} icon={false} />
            <div className="flex flex-wrap gap-2">
              {group.options.map(({ label, emoji }) => (
                <InterestChip
                  key={label}
                  label={label}
                  icon={emoji}
                  selected={isSelected(label)}
                  disabled={isLocked(label)}
                  onClick={() => toggle(label)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </StepWindow>
  );
}
