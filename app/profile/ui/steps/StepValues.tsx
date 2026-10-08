"use client";

import { useTranslations } from "next-intl";
import { ListItem, SelectionGuidance } from "@/components/ui";
import { MAX_VALUES, StepProps, VALUE_OPTIONS } from "@/models/types";
import { StepWindow } from "../StepWindow";
import { useLimitedSelection } from "../useLimitedSelection";

/** Step 5: life values, 1 to MAX_VALUES; the rest lock once the limit is reached. */
export function StepValues({ onNext }: StepProps) {
  const t = useTranslations("profile.steps.values");
  const { count, isSelected, isLocked, toggle } = useLimitedSelection("values", MAX_VALUES);

  return (
    <StepWindow
      title={t("title")}
      onNext={onNext}
      nextDisabled={count === 0}
      nextText={count > 0 ? t("nextWithCount", { count, max: MAX_VALUES }) : undefined}
    >
      <div className="flex flex-col gap-3">
        <SelectionGuidance>{t("guidance", { max: MAX_VALUES })}</SelectionGuidance>
        <div className="flex flex-col gap-2">
          {VALUE_OPTIONS.map(({ label, emoji }) => (
            <ListItem
              key={label}
              label={label}
              icon={emoji}
              selected={isSelected(label)}
              disabled={isLocked(label)}
              onClick={() => toggle(label)}
            />
          ))}
        </div>
      </div>
    </StepWindow>
  );
}
