"use client";

import { useTranslations } from "next-intl";
import { StepContainer, SelectionCard } from "@/components";
import { Profile, StepProps, LOCATIONS } from "@/models/types";
import { useWizardContext } from "../WizardContext";
import { Controller } from "react-hook-form";

export interface StepCountryProps extends StepProps {}

export function StepCountry({ onNext }: StepCountryProps) {
  const t = useTranslations('profile.steps.location');
  const { control, watch } = useWizardContext();
  
  // Watch the country field - react-hook-form will handle updates automatically
  const country = watch("country") || "";

  return (
    <StepContainer
      title={t('title')}
      onNext={onNext}
      nextDisabled={!country}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
        <Controller
          name="country"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <>
              {LOCATIONS.map((location) => (
                <SelectionCard
                  key={location.country}
                  state={field.value === location.country ? "selected" : "default"}
                  type="big card"
                  text={location.country}
                  showImage={false}
                  showEmoji={false}
                  showDescription={false}
                  onClick={() => field.onChange(location.country)}
                />
              ))}
            </>
          )}
        />
      </div>
    </StepContainer>
  );
}
