"use client";

import { StepContainer } from "@/components";
import { Select } from "@telegram-apps/telegram-ui";
import { useState } from "react";
import { ProfileData, StepProps, LOCATIONS } from "../../types";

// Step 10: Location
export interface Step10LocationProps extends StepProps {
  data: ProfileData["location"];
  onUpdate: (location: ProfileData["location"]) => void;
}

export function Step10Location({
  data,
  onNext,
  onBack,
  onUpdate,
}: Step10LocationProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>(data.country);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const nextDisabled = !selectedCountry && !selectedRegion;

  const handleUpdate = () => {
    onUpdate({ country: selectedCountry, region: selectedRegion });
    onNext();
  };

  return (
    <StepContainer
      title="В каком городе ты хочешь найти попутчика?"
      description="Укажи город, где ты планируешь искать попутчика для путешествия"
      onBack={onBack}
      onNext={handleUpdate}
      nextDisabled={nextDisabled}
    >
      <Select
        value={selectedCountry}
        onChange={(e) => setSelectedCountry(e.target.value)}
        required
      >
        {LOCATIONS.map((location) => (
          <option key={location.country} value={location.country}>
            {location.country}
          </option>
        ))}
      </Select>
      {selectedCountry && (
        <Select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          required
        >
          {LOCATIONS.find(
            (location) => location.country === selectedCountry
          )?.regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </Select>
      )}
    </StepContainer>
  );
}
