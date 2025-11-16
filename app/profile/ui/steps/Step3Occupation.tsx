"use client";

import { Input, StepContainer } from "../../../../components";
import { StepProps, ProfileData } from "@/models/types";

// Step 3: Occupation
export interface Step3OccupationProps extends StepProps {
  data: ProfileData["occupation"];
  onUpdate: (occupation: string) => void;
}

export function Step3Occupation({
  data,
  onUpdate,
  onNext
}: Step3OccupationProps) {
  const handleOccupationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(e.target.value);
  };

  const isValidOccupation = data.trim().length >= 2;

  return (
    <StepContainer
      title="Кем ты работаешь?"
      onNext={onNext}
      nextDisabled={!isValidOccupation}
    >
      <Input
        type="text"
        value={data}
        onChange={handleOccupationChange}
        placeholder="Ваша профессия"
        maxLength={50}
        required
      />
      {data && !isValidOccupation && (
        <div className="input-error-text">
          Профессия должна содержать минимум 2 символа
        </div>
      )}
    </StepContainer>
  );
}
