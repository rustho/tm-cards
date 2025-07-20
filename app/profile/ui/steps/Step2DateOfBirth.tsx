"use client";

import { Input, StepContainer } from "../../../../components";
import { StepProps, ProfileData } from "@/models/types";
import { validateDateOfBirth, calculateAge, formatDateForInput } from "@/lib/dateUtils";

// Step 2: Date of Birth
export interface Step2DateOfBirthProps extends StepProps {
  data: ProfileData["dateOfBirth"];
  onUpdate: (dateOfBirth: string) => void;
}

export function Step2DateOfBirth({ data, onUpdate, onNext, onBack }: Step2DateOfBirthProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onUpdate(value);
  };

  const validation = data ? validateDateOfBirth(data) : { isValid: false };
  const isValidDate = validation.isValid;
  
  // Calculate and display current age if valid date
  const displayAge = data && isValidDate ? calculateAge(data) : null;

  // Set max date to 18 years ago from today
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  const maxDateString = formatDateForInput(maxDate.toISOString());

  // Set min date to 100 years ago from today
  const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
  const minDateString = formatDateForInput(minDate.toISOString());

  return (
    <StepContainer
      title="Когда ты родился?"
      description="Выберите дату вашего рождения (возраст от 18 до 100 лет)"
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!isValidDate}
    >
      <Input
        type="date"
        value={data || ""}
        onChange={handleDateChange}
        placeholder="Дата рождения"
        min={minDateString}
        max={maxDateString}
        required
      />
      
      {displayAge && (
        <div className="age-display">
          Ваш возраст: {displayAge} лет
        </div>
      )}
      
      {data && !isValidDate && validation.errorMessage && (
        <div className="input-error-text">
          {validation.errorMessage === 'You must be at least 18 years old' ? 'Вам должно быть не менее 18 лет' :
           validation.errorMessage === 'Age cannot exceed 100 years' ? 'Возраст не может превышать 100 лет' :
           'Неверный формат даты'}
        </div>
      )}
    </StepContainer>
  );
} 