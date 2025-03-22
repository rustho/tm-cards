"use client";

import { Input, StepContainer } from "@/components";
import { StepProps, Profile } from "@/models/types";

export interface Step9InstagramProps extends StepProps {
  data: Profile["instagram"];
  onUpdate: (instagram: string) => void;
}

export function Step9Instagram({
  data,
  onUpdate,
  onNext,
  onBack,
}: Step9InstagramProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove @ symbol if present
    const value = e.target.value.replace(/^@/, "");
    onUpdate(value);
  };

  return (
    <StepContainer
      title="Пришли ник своего инстаграма без ссылки и значка @"
      description="Это поможет нам лучше познакомиться с тобой"
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!data.trim()}
    >
      <Input
        type="text"
        value={data}
        onChange={handleChange}
        placeholder="username"
        required
      />
    </StepContainer>
  );
}
