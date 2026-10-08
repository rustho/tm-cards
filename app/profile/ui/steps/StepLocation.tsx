"use client";

import { useTranslations } from "next-intl";
import { CountryCard, UnlockDivider } from "@/components/ui";
import { StepProps, LOCATIONS } from "@/models/types";
import { useWizardContext } from "../WizardContext";
import { StepWindow } from "../StepWindow";

const AVAILABLE = LOCATIONS.filter((l) => l.available);
const UPCOMING = LOCATIONS.filter((l) => !l.available);

/** Step 1: pick a meeting location; writes both `country` and `region`. */
export function StepLocation({ onNext }: StepProps) {
  const t = useTranslations("profile.steps.location");
  const { watch, setValue } = useWizardContext();

  const country = watch("country") || "";
  const region = watch("region") || "";
  const selected = AVAILABLE.find((l) => l.country === country && l.region === region);

  return (
    <StepWindow title={t("title")} onNext={onNext} nextDisabled={!selected}>
      <div className="flex flex-col gap-4">
        {AVAILABLE.map((location) => (
          <CountryCard
            key={location.label}
            label={location.label}
            icon={<span className="text-[24px] leading-none">{location.flag}</span>}
            state={location === selected ? "selected" : "default"}
            onClick={() => {
              setValue("country", location.country, { shouldDirty: true });
              setValue("region", location.region, { shouldDirty: true });
            }}
          />
        ))}

        {UPCOMING.length > 0 && (
          <div className="flex flex-col">
            <UnlockDivider label={t("upcoming")} className="mb-2" />
            {UPCOMING.map((location) => (
              <CountryCard
                key={location.label}
                label={location.label}
                icon={<span className="text-[24px] leading-none opacity-60">{location.flag}</span>}
                state="locked"
              />
            ))}
          </div>
        )}
      </div>
    </StepWindow>
  );
}
