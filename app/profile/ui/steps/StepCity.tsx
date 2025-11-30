"use client";

import { useTranslations } from "next-intl";
import { StepContainer } from "@/components";
import { Select } from "@telegram-apps/telegram-ui";
import { useState, useEffect } from "react";
import { Profile, StepProps, LOCATIONS } from "@/models/types";

export interface StepCityProps extends StepProps {
  data: Partial<Profile>;
  onUpdate: (data: Partial<Profile>) => void;
}

export function StepCity({
  data,
  onNext,
  onUpdate,
}: StepCityProps) {
  const t = useTranslations('profile.steps.location');
  const [selectedRegion, setSelectedRegion] = useState<string>(data.region || "");
  const country = data.country;

  useEffect(() => {
    setSelectedRegion(data.region || "");
  }, [data.region]);

  const handleNext = () => {
    onUpdate({ region: selectedRegion });
    onNext();
  };

  const regions = LOCATIONS.find(
    (location) => location.country === country
  )?.regions || [];

  return (
    <StepContainer
      title="А где именно?" // "And where exactly?"
      onNext={handleNext}
      nextDisabled={!selectedRegion}
    >
      <Select
        value={selectedRegion}
        onChange={(e) => setSelectedRegion(e.target.value)}
        required
        disabled={!country}
      >
        <option value="" disabled>{country ? "Выберите регион" : "Сначала выберите страну"}</option>
        {regions.map((region) => (
          <option key={region} value={region}>
            {region}
          </option>
        ))}
      </Select>
    </StepContainer>
  );
}
