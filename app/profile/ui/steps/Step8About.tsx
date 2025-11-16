"use client";

import { Input, StepContainer } from "@/components";
import { ProfileData, StepProps } from "@/models/types";

// Step 8: About
export interface Step8AboutProps extends StepProps {
  data: ProfileData["about"];
  onUpdate: (about: string) => void;
}
const MAX_CHARS = 284;

export function Step8About({
  data,
  onUpdate,
  onNext,
}: Step8AboutProps) {
  return (
    <StepContainer
      title="Расскажи самое важное и интересное о себе в свободной форме."
      onNext={onNext}
      nextDisabled={!data.trim()}
    >
      <Input
        type="text"
        value={data}
        onChange={(e) => onUpdate(e.target.value.slice(0, MAX_CHARS))}
        placeholder="Расскажите о себе..."
        maxLength={MAX_CHARS}
        required
      />
      <div className="character-count">
        {data.length}/{MAX_CHARS}
      </div>
    </StepContainer>
  );
}
