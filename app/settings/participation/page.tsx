"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { AccountSettings, Participation, ParticipationChoice } from "@/models/types";
import { api } from "@/lib/api";
import { updateCache, useCachedApi } from "@/lib/apiCache";
import { formatDayMonth } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";
import { BackButton } from "@/components/ui/back-button";
import { MenuList } from "@/components/ui/menu-list";

const CHOICES: { value: ParticipationChoice; icon: string }[] = [
  { value: "active", icon: "✅" },
  { value: "pause_week", icon: "⏸️" },
  { value: "pause_custom", icon: "📅" },
];

/** YYYY-MM-DD of tomorrow (local), the earliest date a custom pause can end. */
function tomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * «Участие во встречах»: participate, pause for a week, or pause until a date. Every choice saves
 * at once (a custom pause once a date is picked). Legacy pauses (month / indefinite) select nothing
 * and show their state below the list.
 */
export default function ParticipationPage() {
  const t = useTranslations("settings.participation");
  const { data: settings, error: loadError } = useCachedApi<AccountSettings>("/api/settings");
  const participation = settings?.participation;
  // The custom option is shown selected while its date is being picked, before anything is saved.
  const [pickingDate, setPickingDate] = useState(false);
  // The choice being saved, shown selected right away (a save takes a few seconds).
  const [pending, setPending] = useState<ParticipationChoice | null>(null);
  const saving = pending !== null;
  const [error, setError] = useState(false);

  const current: ParticipationChoice | null = !participation
    ? null
    : participation.option === "active"
      ? participation.skipNextRound ? null : "active"
      : participation.option === "pause_week" || participation.option === "pause_custom"
        ? participation.option
        : null;
  const selected = pending ?? (pickingDate ? "pause_custom" : current);

  const save = async (option: ParticipationChoice, resumeDate?: string) => {
    setPending(option);
    setError(false);
    try {
      const next = await api.put<Participation>("/api/settings/participation", { option, resumeDate });
      updateCache<AccountSettings>("/api/settings", (s) => ({ ...s, participation: next }));
      setPickingDate(false);
    } catch (err) {
      console.error("Failed to save participation:", err);
      setError(true);
    } finally {
      setPending(null);
    }
  };

  const choose = (option: ParticipationChoice) => {
    if (saving) return;
    if (option === "pause_custom") return setPickingDate(true);
    setPickingDate(false);
    if (option !== current) void save(option);
  };

  const customDate = participation?.option === "pause_custom" && participation.resumeDate
    ? participation.resumeDate.slice(0, 10)
    : "";

  return (
    <div className="mx-auto min-h-screen max-w-xl space-y-4 px-4 pb-12 pt-4">
      <BackButton />
      <div className="space-y-2">
        <h1 className="m-0 text-[28px] font-bold leading-9">{t("title")}</h1>
        <p className="m-0 text-body text-muted-foreground">{t("subtitle")}</p>
      </div>

      {!participation ? (
        loadError ? (
          <p className="m-0 py-12 text-center text-body text-destructive">{t("saveFailed")}</p>
        ) : (
          <div className="flex justify-center py-12">
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )
      ) : (
        <>
          <MenuList role="radiogroup" aria-label={t("title")}>
            {CHOICES.map(({ value, icon }) => {
              const checked = selected === value;
              return (
                <li key={value}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    aria-busy={saving && checked}
                    disabled={saving}
                    onClick={() => choose(value)}
                    className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 disabled:cursor-wait"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center text-[24px] leading-none" aria-hidden>
                      {icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-option">{t(`options.${value}`)}</span>
                      <span className="block text-body text-muted-foreground">{t(`descriptions.${value}`)}</span>
                    </span>
                    <span
                      className={cn(
                        "size-5 shrink-0 rounded-full border-2",
                        checked ? "border-primary bg-primary shadow-[inset_0_0_0_3px_hsl(var(--card))]" : "border-divider"
                      )}
                      aria-hidden
                    />
                  </button>
                </li>
              );
            })}
          </MenuList>

          {selected === "pause_custom" && (
            <label className="block space-y-2 rounded-md border border-divider bg-card p-4">
              <span className="block text-body text-muted-foreground">{t("resumeDate")}</span>
              <input
                type="date"
                min={tomorrow()}
                defaultValue={customDate}
                disabled={saving}
                onChange={(e) => e.target.value && void save("pause_custom", e.target.value)}
                className="w-full rounded-md border border-divider bg-background px-3 py-2 text-option text-foreground"
              />
            </label>
          )}

          {participation.option !== "active" && participation.resumeDate && (
            <p className="m-0 text-body text-muted-foreground">
              {t("resumesOn", { date: formatDayMonth(participation.resumeDate) })}
            </p>
          )}
          {participation.option !== "active" && !participation.resumeDate && (
            <p className="m-0 text-body text-muted-foreground">{t("pausedIndefinitely")}</p>
          )}
          {participation.option === "active" && participation.skipNextRound && (
            <p className="m-0 text-body text-muted-foreground">{t("skipping")}</p>
          )}
          {error && <p className="m-0 text-body text-destructive">{t("saveFailed")}</p>}
        </>
      )}
    </div>
  );
}
