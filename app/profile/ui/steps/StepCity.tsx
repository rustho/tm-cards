"use client";

import { useTranslations } from "next-intl";
import { StepContainer, SelectionCard } from "@/components";
import { useEffect } from "react";
import { Profile, StepProps, LOCATIONS } from "@/models/types";
import { useWizardContext } from "../WizardContext";
import { Controller } from "react-hook-form";

export interface StepCityProps extends StepProps {}

export function StepCity({ onNext }: StepCityProps) {
  const t = useTranslations("profile.steps.location");
  const { control, watch, setValue } = useWizardContext();

  // Watch both country and region fields - react-hook-form handles reactivity!
  const country = watch("country");
  const region = watch("region") || "";

  // Reset region when country changes
  useEffect(() => {
    if (country && region) {
      // Check if current region is valid for the new country
      const validRegions =
        LOCATIONS.find((location) => location.country === country)?.regions ||
        [];
      if (!validRegions.includes(region)) {
        setValue("region", "", { shouldValidate: true });
      }
    } else if (!country) {
      setValue("region", "", { shouldValidate: true });
    }
  }, [country, region, setValue]);

  const regions =
    LOCATIONS.find((location) => location.country === country)?.regions || [];

  if (!country) {
    return (
      <StepContainer title={t("titleCity")} onNext={onNext} nextDisabled={true}>
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            color: "var(--tg-theme-hint-color, #999)",
          }}
        >
          {t("selectCountryFirst")}
        </div>
      </StepContainer>
    );
  }

  return (
    <StepContainer
      title={t("titleCity")}
      onNext={onNext}
      nextDisabled={!region}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <Controller
          name="region"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <>
              {regions.map((regionOption) => (
                <SelectionCard
                  key={regionOption}
                  state={field.value === regionOption ? "selected" : "default"}
                  type="big card"
                  text={regionOption}
                  showImage={false}
                  showEmoji={false}
                  showDescription={false}
                  onClick={() => field.onChange(regionOption)}
                />
              ))}
            </>
          )}
        />
      </div>
    </StepContainer>
  );
}
