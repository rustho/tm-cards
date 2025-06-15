"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FooterMenu } from "@/components/FooterMenu";
import { Button, Cell, List, Section } from "@telegram-apps/telegram-ui";

export default function Settings() {
  const router = useRouter();
  const t = useTranslations('settings');

  const settingsOptions = [
    {
      title: t('editProfile.title'),
      description: t('editProfile.description'),
      icon: "👤",
      onClick: () => router.push("/profile"),
    },
    {
      title: t('notifications.title'),
      description: t('notifications.description'),
      icon: "🔔",
      onClick: () => router.push("/settings/notifications"),
    },
    {
      title: t('subscription.title'),
      description: t('subscription.description'),
      icon: "💎",
      onClick: () => router.push("/settings/subscription"),
    },
    {
      title: t('matchingSchedule.title'),
      description: t('matchingSchedule.description'),
      icon: "📅",
      onClick: () => router.push("/settings/matching-schedule"),
    },
  ];

  return (
    <div className="container mx-auto p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
      
      <Section>
        <List>
          {settingsOptions.map((option, index) => (
            <Cell
              key={index}
              before={<span className="text-2xl">{option.icon}</span>}
              subtitle={option.description}
              onClick={option.onClick}
              style={{ cursor: 'pointer' }}
            >
              {option.title}
            </Cell>
          ))}
        </List>
      </Section>

      <FooterMenu />
    </div>
  );
} 