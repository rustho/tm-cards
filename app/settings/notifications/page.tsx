"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSignal, initData } from "@telegram-apps/sdk-react";
import { Button, Cell, List, Section, Switch } from "@telegram-apps/telegram-ui";
import { settingsService } from "@/lib/settingsService";
import type { NotificationSettings } from "@/models/types";

export default function NotificationSettings() {
  const router = useRouter();
  const t = useTranslations('settings.notifications');
  const tCommon = useTranslations('settings.common');
  const user = useSignal(initData.user);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    newMatches: true,
    messages: true,
    profileViews: false,
    gameInvites: true,
    weeklyDigest: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        const settings = await settingsService.getNotificationSettings(user?.id?.toString());
        setNotifications(settings);
      } catch (error) {
        console.error("Error fetching notification settings:", error);
        // Keep default settings if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationSettings();
  }, [user?.id]);

  const handleToggle = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await settingsService.updateNotificationSettings(
        notifications,
        user?.id?.toString()
      );
      
      if (result.success) {
        alert(t('savedSuccessfully'));
        router.back();
      }
    } catch (error) {
      console.error("Error saving notification settings:", error);
      alert(t('saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">{t('loading')}</div>
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
        <List>
          <Cell
            after={
              <Switch
                checked={notifications.newMatches}
                onChange={() => handleToggle('newMatches')}
              />
            }
            subtitle={t('newMatchesDesc')}
          >
            {t('newMatches')}
          </Cell>
          
          <Cell
            after={
              <Switch
                checked={notifications.messages}
                onChange={() => handleToggle('messages')}
              />
            }
            subtitle={t('messagesDesc')}
          >
            {t('messages')}
          </Cell>
          
          <Cell
            after={
              <Switch
                checked={notifications.profileViews}
                onChange={() => handleToggle('profileViews')}
              />
            }
            subtitle={t('profileViewsDesc')}
          >
            {t('profileViews')}
          </Cell>
          
          <Cell
            after={
              <Switch
                checked={notifications.gameInvites}
                onChange={() => handleToggle('gameInvites')}
              />
            }
            subtitle={t('gameInvitesDesc')}
          >
            {t('gameInvites')}
          </Cell>
          
          <Cell
            after={
              <Switch
                checked={notifications.weeklyDigest}
                onChange={() => handleToggle('weeklyDigest')}
              />
            }
            subtitle={t('weeklyDigestDesc')}
          >
            {t('weeklyDigest')}
          </Cell>
        </List>
      </Section>

      <div className="mt-6">
        <Button
          onClick={handleSave}
          size="l"
          stretched
          loading={saving}
        >
          {saving ? t('saving') : t('saveChanges')}
        </Button>
      </div>
    </div>
  );
} 