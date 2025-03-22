"use client";

import { Input, StepContainer } from "../../../../components";
import { StepProps, ProfileData } from "@/models/types";

// Step 2: Age
export interface Step2AgeProps extends StepProps {
  data: ProfileData["age"];
  onUpdate: (age: string) => void;
}

export function Step2Age({ data, onUpdate, onNext, onBack }: Step2AgeProps) {
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value === "" || (parseInt(value) >= 0 && parseInt(value) <= 100)) {
      onUpdate(value);
    }
  };

  const isValidAge = data && parseInt(data) >= 18 && parseInt(data) <= 100;

  return (
    <StepContainer
      title="Сколько тебе лет?"
      description="Введите ваш возраст (от 18 до 100)"
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!isValidAge}
    >
      <Input
        type="text"
        pattern="[0-9]*"
        inputMode="numeric"
        value={data}
        onChange={handleAgeChange}
        placeholder="Ваш возраст"
        maxLength={3}
        required
      />
      {data && !isValidAge && (
        <div className="input-error-text">
          Возраст должен быть от 18 до 100 лет
        </div>
      )}
    </StepContainer>
  );
}
