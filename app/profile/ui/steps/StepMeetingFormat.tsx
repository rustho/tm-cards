"use client";

import { useTranslations } from "next-intl";
import { ListItem, SelectionGuidance } from "@/components/ui";
import { MAX_MEETING_FORMATS, MEETING_FORMAT_OPTIONS, StepProps } from "@/models/types";
import { StepWindow } from "../StepWindow";
import { useLimitedSelection } from "../useLimitedSelection";

/** Step 8: preferred meeting formats, 1 to MAX_MEETING_FORMATS. */
export function StepMeetingFormat({ onNext }: StepProps) {
  const t = useTranslations("profile.steps.meetingFormat");
  const { count, isSelected, isLocked, toggle } = useLimitedSelection("meetingFormats", MAX_MEETING_FORMATS);

  return (
    <StepWindow
      title={t("title")}
      onNext={onNext}
      nextDisabled={count === 0}
      nextText={count > 0 ? t("nextWithCount", { count, max: MAX_MEETING_FORMATS }) : undefined}
    >
      <div className="flex flex-col gap-3">
        <SelectionGuidance>{t("guidance", { max: MAX_MEETING_FORMATS })}</SelectionGuidance>
        <div className="flex flex-col gap-2">
          {MEETING_FORMAT_OPTIONS.map(({ label, emoji }) => (
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
