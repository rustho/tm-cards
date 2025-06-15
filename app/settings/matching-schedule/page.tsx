"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSignal, initData } from "@telegram-apps/sdk-react";
import { Button, Cell, List, Section } from "@telegram-apps/telegram-ui";
import { settingsService } from "@/lib/settingsService";
import type { MatchingScheduleSettings } from "@/models/types";

export default function MatchingSchedule() {
  const router = useRouter();
  const t = useTranslations('settings.matchingSchedule');
  const tCommon = useTranslations('settings.common');
  const user = useSignal(initData.user);
  const [selectedOption, setSelectedOption] = useState("active");
  const [customDate, setCustomDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const scheduleOptions = [
    {
      value: "active",
      label: t('options.active'),
      description: t('options.activeDesc'),
      icon: "✅"
    },
    {
      value: "pause_week",
      label: t('options.pauseWeek'),
      description: t('options.pauseWeekDesc'),
      icon: "⏸️"
    },
    {
      value: "pause_month",
      label: t('options.pauseMonth'),
      description: t('options.pauseMonthDesc'),
      icon: "⏸️"
    },
    {
      value: "pause_custom",
      label: t('options.pauseCustom'),
      description: t('options.pauseCustomDesc'),
      icon: "📅"
    },
    {
      value: "pause_indefinite",
      label: t('options.pauseIndefinite'),
      description: t('options.pauseIndefiniteDesc'),
      icon: "⏹️"
    }
  ];

  useEffect(() => {
    const fetchMatchingSchedule = async () => {
      try {
        const settings = await settingsService.getMatchingSchedule(user?.id?.toString());
        setSelectedOption(settings.option);
        if (settings.customDate) {
          // Convert ISO date to input format (YYYY-MM-DD)
          setCustomDate(settings.customDate.split('T')[0]);
        }
      } catch (error) {
        console.error("Error fetching matching schedule:", error);
        // Keep default settings if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchMatchingSchedule();
  }, [user?.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await settingsService.updateMatchingSchedule(
        {
          option: selectedOption,
          customDate: selectedOption === "pause_custom" ? customDate : undefined
        },
        user?.id?.toString()
      );
      
      if (result.success) {
        alert(t('savedSuccessfully'));
        router.back();
      }
    } catch (error) {
      console.error("Error saving matching schedule:", error);
      alert(t('saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const getResumeDate = () => {
    const now = new Date();
    switch (selectedOption) {
      case "pause_week":
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + 7);
        return nextWeek.toLocaleDateString();
      case "pause_month":
        const nextMonth = new Date(now);
        nextMonth.setMonth(now.getMonth() + 1);
        return nextMonth.toLocaleDateString();
      case "pause_custom":
        return customDate ? new Date(customDate).toLocaleDateString() : "Not set";
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">{tCommon('loading')}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button
          mode="plain"
          onClick={() => router.back()}
          className="mr-4"
        >
          {tCommon('back')}
        </Button>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
      </div>

      <Section>
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">💡 {t('aboutTitle')}</h3>
          <p className="text-sm text-gray-600">
            {t('aboutDesc')}
          </p>
        </div>

        <List>
          {scheduleOptions.map((option) => (
            <Cell
              key={option.value}
              before={<span className="text-xl">{option.icon}</span>}
              subtitle={option.description}
              after={
                <input
                  type="radio"
                  name="schedule"
                  value={option.value}
                  checked={selectedOption === option.value}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="w-5 h-5"
                />
              }
              onClick={() => setSelectedOption(option.value)}
              style={{ cursor: 'pointer' }}
            >
              {option.label}
            </Cell>
          ))}
        </List>

        {selectedOption === "pause_custom" && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium mb-2">
              {t('selectResumeDate')}
            </label>
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {selectedOption !== "active" && getResumeDate() && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm">
              <strong>{t('matchingWillResume')}</strong> {getResumeDate()}
            </p>
          </div>
        )}

        {selectedOption === "pause_indefinite" && (
          <div className="mt-4 p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-700">
              <strong>{t('indefiniteNote')}</strong>
            </p>
          </div>
        )}
      </Section>

      <div className="mt-6 space-y-3">
        <Button
          onClick={handleSave}
          size="l"
          stretched
          loading={saving}
        >
          {saving ? t('saving') : t('saveSchedule')}
        </Button>
        
        {selectedOption !== "active" && (
          <Button
            onClick={() => setSelectedOption("active")}
            mode="outline"
            size="l"
            stretched
          >
            {t('resumeNow')}
          </Button>
        )}
      </div>
    </div>
  );
} 