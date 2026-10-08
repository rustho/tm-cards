"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { settingsService } from "@/lib/settingsService";
import type { MatchingScheduleSettings } from "@/models/types";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Option = MatchingScheduleSettings["option"];

export default function MatchingSchedulePage() {
  const router = useRouter();
  const t = useTranslations("settings.matchingSchedule");
  const tCommon = useTranslations("settings.common");
  const [selectedOption, setSelectedOption] = useState<Option>("active");
  const [customDate, setCustomDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scheduleOptions: Array<{ value: Option; label: string; description: string; icon: string }> = [
    { value: "active", label: t("options.active"), description: t("options.activeDesc"), icon: "✅" },
    { value: "pause_week", label: t("options.pauseWeek"), description: t("options.pauseWeekDesc"), icon: "⏸️" },
    { value: "pause_month", label: t("options.pauseMonth"), description: t("options.pauseMonthDesc"), icon: "⏸️" },
    { value: "pause_custom", label: t("options.pauseCustom"), description: t("options.pauseCustomDesc"), icon: "📅" },
    { value: "pause_indefinite", label: t("options.pauseIndefinite"), description: t("options.pauseIndefiniteDesc"), icon: "⏹️" },
  ];

  useEffect(() => {
    let cancelled = false;
    settingsService
      .getMatchingSchedule()
      .then((settings) => {
        if (cancelled) return;
        setSelectedOption(settings.option);
        if (settings.customDate) setCustomDate(settings.customDate.split("T")[0]);
      })
      .catch((err) => console.error("Error fetching matching schedule:", err))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const result = await settingsService.updateMatchingSchedule({
        option: selectedOption,
        customDate: selectedOption === "pause_custom" ? customDate : undefined,
      });
      if (result.success) router.back();
    } catch (err) {
      console.error("Error saving matching schedule:", err);
      setError(t("saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const resumeDate = (() => {
    const now = new Date();
    switch (selectedOption) {
      case "pause_week":
        return new Date(now.setDate(now.getDate() + 7)).toLocaleDateString();
      case "pause_month":
        return new Date(now.setMonth(now.getMonth() + 1)).toLocaleDateString();
      case "pause_custom":
        return customDate ? new Date(customDate).toLocaleDateString() : null;
      default:
        return null;
    }
  })();

  if (loading) {
    return <div className="container p-4 text-center">{tCommon("loading")}</div>;
  }

  return (
    <div className="container p-4 pb-24">
      <div className="mb-6 flex items-center gap-2">
        <BackButton />
        <h1 className="text-2xl font-bold">{t("title")}</h1>
      </div>

      <Card className="mb-4 bg-primary/10">
        <CardContent className="p-4">
          <h3 className="mb-1 font-semibold">💡 {t("aboutTitle")}</h3>
          <p className="text-sm text-muted-foreground">{t("aboutDesc")}</p>
        </CardContent>
      </Card>

      <Card className="divide-y" role="radiogroup">
        {scheduleOptions.map((option) => {
          const checked = selectedOption === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => setSelectedOption(option.value)}
              className={cn(
                "flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-muted/60",
                checked && "bg-primary/10"
              )}
            >
              <span className="text-xl">{option.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-muted-foreground">{option.description}</div>
              </div>
              <span
                className={cn(
                  "h-5 w-5 shrink-0 rounded-full border-2",
                  checked ? "border-primary bg-primary" : "border-muted-foreground/40"
                )}
              />
            </button>
          );
        })}
      </Card>

      {selectedOption === "pause_custom" && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <label className="mb-2 block text-sm font-medium">{t("selectResumeDate")}</label>
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full rounded-md border border-input bg-background p-2"
            />
          </CardContent>
        </Card>
      )}

      {selectedOption !== "active" && resumeDate && (
        <Card className="mt-4 bg-warning/10">
          <CardContent className="p-4 text-sm">
            <strong>{t("matchingWillResume")}</strong> {resumeDate}
          </CardContent>
        </Card>
      )}

      {selectedOption === "pause_indefinite" && (
        <Card className="mt-4 bg-warning/10">
          <CardContent className="p-4 text-sm font-medium">{t("indefiniteNote")}</CardContent>
        </Card>
      )}

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-6 space-y-3">
        <Button className="w-full" size="lg" onClick={handleSave} disabled={saving}>
          {saving ? t("saving") : t("saveSchedule")}
        </Button>
        {selectedOption !== "active" && (
          <Button className="w-full" size="lg" variant="outline" onClick={() => setSelectedOption("active")}>
            {t("resumeNow")}
          </Button>
        )}
      </div>
    </div>
  );
}
