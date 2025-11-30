"use client";

import { useTranslations } from "next-intl";
import { StepContainer } from "@/components";
import { Select } from "@telegram-apps/telegram-ui";
import { useState, useEffect } from "react";
import { Profile, StepProps, LOCATIONS } from "@/models/types";

export interface StepCountryProps extends StepProps {
  data: Partial<Profile>;
  onUpdate: (data: Partial<Profile>) => void;
}

export function StepCountry({
  data,
  onNext,
  onUpdate,
}: StepCountryProps) {
  const t = useTranslations('profile.steps.location');
  const [selectedCountry, setSelectedCountry] = useState<string>(data.country || "");

  useEffect(() => {
    setSelectedCountry(data.country || "");
  }, [data.country]);

  const handleNext = () => {
    onUpdate({ country: selectedCountry });
    onNext();
  };

  return (
    <StepContainer
      title="Откуда ты?" // "Where are you from?" - Russian
      onNext={handleNext}
      nextDisabled={!selectedCountry}
    >
      <Select
        value={selectedCountry}
        onChange={(e) => setSelectedCountry(e.target.value)}
        required
      >
        <option value="" disabled>Выберите страну</option>
        {LOCATIONS.map((location) => (
          <option key={location.country} value={location.country}>
            {location.country}
          </option>
        ))}
      </Select>
    </StepContainer>
  );
}
