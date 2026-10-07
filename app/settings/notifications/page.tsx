"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronLeft } from "lucide-react";
import { settingsService } from "@/lib/settingsService";
import type { NotificationSettings } from "@/models/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const KEYS: Array<keyof NotificationSettings> = ["newMatches", "messages", "profileViews", "gameInvites", "weeklyDigest"];

export default function NotificationSettingsPage() {
  const router = useRouter();
  const t = useTranslations("settings.notifications");
  const tCommon = useTranslations("settings.common");
  const [notifications, setNotifications] = useState<NotificationSettings>({
    newMatches: true,
    messages: true,
    profileViews: false,
    gameInvites: true,
    weeklyDigest: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    settingsService
      .getNotificationSettings()
      .then((settings) => !cancelled && setNotifications(settings))
      .catch((error) => console.error("Error fetching notification settings:", error))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggle = (key: keyof NotificationSettings) =>
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const result = await settingsService.updateNotificationSettings(notifications);
      if (result.success) {
        setMessage({ kind: "ok", text: t("savedSuccessfully") });
        router.back();
      }
    } catch (error) {
      console.error("Error saving notification settings:", error);
      setMessage({ kind: "error", text: t("saveFailed") });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container p-4 text-center">{t("loading")}</div>;
  }

  return (
    <div className="container p-4 pb-24">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ChevronLeft /> {tCommon("back")}
        </Button>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
      </div>

      <Card className="divide-y">
        {KEYS.map((key) => (
          <label key={key} className="flex cursor-pointer items-center justify-between gap-4 p-4">
            <div>
              <div className="font-medium">{t(key)}</div>
              <div className="text-sm text-muted-foreground">{t(`${key}Desc`)}</div>
            </div>
            <Switch checked={notifications[key]} onCheckedChange={() => handleToggle(key)} />
          </label>
        ))}
      </Card>

      {message && (
        <p className={`mt-4 text-sm ${message.kind === "error" ? "text-destructive" : "text-success"}`}>{message.text}</p>
      )}

      <Button className="mt-6 w-full" size="lg" onClick={handleSave} disabled={saving}>
        {saving ? t("saving") : t("saveChanges")}
      </Button>
    </div>
  );
}
