"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, MapPin } from "lucide-react";
import { api } from "@/lib/api";
import { invalidateCache, updateCache, useCachedApi } from "@/lib/apiCache";
import type { MeetingsWeek } from "@/models/types";

type Place = { country: string; region: string };
type ReferenceData = { locations: { country: string; regions: string[] }[] };

const key = (p: Place) => `${p.country}|${p.region}`;

/** «📍 Белград ⌄»: the city from the profile; a native select over the label changes it. */
export const LocationPicker = ({ initial }: { initial: Place | null }) => {
  const t = useTranslations("meetingsTab");
  const [place, setPlace] = useState<Place | null>(initial);
  // The tab renders a cached copy first; take the fresh city when it arrives.
  useEffect(() => setPlace(initial), [initial?.country, initial?.region]); // eslint-disable-line react-hooks/exhaustive-deps
  const { data } = useCachedApi<ReferenceData>("/api/reference");
  const options = useMemo<Place[]>(
    () =>
      (data?.locations ?? []).flatMap(({ country, regions }) =>
        regions.length ? regions.map((region) => ({ country, region })) : [{ country, region: "" }]
      ),
    [data]
  );

  const change = async (value: string) => {
    const next = options.find((o) => key(o) === value);
    if (!next) return;
    const previous = place;
    setPlace(next);
    try {
      await api.post("/api/profile", next);
      updateCache<MeetingsWeek>("/api/meetings/current", (week) => ({ ...week, location: next }));
      invalidateCache("/api/profile");
    } catch (error) {
      console.error("Error saving location:", error);
      setPlace(previous);
    }
  };

  const countries = Array.from(new Set(options.map((o) => o.country)));

  return (
    <label className="relative mx-auto flex w-fit items-center gap-2 text-option text-primary">
      <MapPin className="size-5 fill-success text-success [&>circle]:fill-card" aria-hidden />
      <span>{place ? place.region || place.country : t("chooseCity")}</span>
      <ChevronDown className="size-5" aria-hidden />
      <select
        aria-label={t("chooseCity")}
        value={place ? key(place) : ""}
        onChange={(e) => change(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {!place && <option value="">{t("chooseCity")}</option>}
        {countries.map((country) => (
          <optgroup key={country} label={country}>
            {options
              .filter((o) => o.country === country)
              .map((o) => (
                <option key={key(o)} value={key(o)}>
                  {o.region || o.country}
                </option>
              ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
};
