"use client";

import { useTranslations } from "next-intl";
import { StepContainer } from "@/components";
import { Select } from "@telegram-apps/telegram-ui";
import { useState } from "react";
import { Profile, StepProps, LOCATIONS } from "@/models/types";

// Step 10: Location
export interface Step10LocationProps extends StepProps {
  data: {
    country: Profile["country"];
    region: Profile["region"];
  };
  onUpdate: (location: {
    country: Profile["country"];
    region: Profile["region"];
  }) => void;
}

export function Step10Location({
  data,
  onNext,
  onUpdate,
}: Step10LocationProps) {
  const t = useTranslations('profile.steps.location');
  const [selectedCountry, setSelectedCountry] = useState<string>(data.country);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const nextDisabled = !selectedCountry && !selectedRegion;

  const handleUpdate = () => {
    onUpdate({ country: selectedCountry, region: selectedRegion });
    onNext();
  };

  return (
    <StepContainer
      title={t('title')}
      description={t('description')}
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
