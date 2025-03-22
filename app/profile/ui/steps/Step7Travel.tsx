"use client";

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
  onBack,
}: Step7TravelProps) {
  return (
    <StepContainer
      title="Куда ты планируешь поехать в ближайшие 3 месяца?"
      description="Например: Париж, Франция или Токио, Япония"
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!data.trim()}
    >
      <Input
        type="text"
        value={data}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder="Введите города и страны"
        required
      />
    </StepContainer>
  );
}
