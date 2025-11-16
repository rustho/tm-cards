"use client";

import { useTranslations } from "next-intl";
import { Input, StepContainer } from "@/components";
import { StepProps, Profile } from "@/models/types";

// Step 7: Travel
export interface Step7TravelProps extends StepProps {
  data: Profile["placesToVisit"];
  onUpdate: (placesToVisit: string) => void;
}

export function Step7Travel({
  data,
  onUpdate,
  onNext,
}: Step7TravelProps) {
  const t = useTranslations('profile.steps.travel');
  
  return (
    <StepContainer
      title={t('title')}
      onNext={onNext}
      nextDisabled={!data.trim()}
    >
      <Input
        type="text"
        value={data}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder={t('placeholder')}
        required
      />
    </StepContainer>
  );
}
