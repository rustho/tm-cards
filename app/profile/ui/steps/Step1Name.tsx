"use client";

import { Input, StepContainer } from "../../../../components";
import { StepProps, Profile } from "@/models/types";

export interface Step1NameProps extends StepProps {
  data: Profile["name"];
  onUpdate: (name: string) => void;
}

export function Step1Name({ data, onUpdate, onNext, onBack }: Step1NameProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(e.target.value);
  };

  const isValidName = data.trim().length >= 2;

  return (
    <StepContainer
      title="Как тебя зовут?"
      description="Введите ваше имя"
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!isValidName}
    >
      <Input
        type="text"
        value={data}
        onChange={handleNameChange}
        placeholder="Ваше имя"
        maxLength={50}
        required
      />
      {data && !isValidName && (
        <div className="input-error-text">
          Имя должно содержать минимум 2 символа
        </div>
      )}
    </StepContainer>
  );
}
