"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { FooterMenu } from "@/components/FooterMenu";
import { Card } from "@/components/ui/card";

export default function Settings() {
  const t = useTranslations("settings");

  const options = [
    { title: t("editProfile.title"), description: t("editProfile.description"), icon: "👤", href: "/settings/profile" },
    { title: t("notifications.title"), description: t("notifications.description"), icon: "🔔", href: "/settings/notifications" },
    { title: t("subscription.title"), description: t("subscription.description"), icon: "💎", href: "/settings/subscription" },
    { title: t("matchingSchedule.title"), description: t("matchingSchedule.description"), icon: "📅", href: "/settings/matching-schedule" },
  ];

  return (
    <div className="container p-4 pb-24">
      <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>

      <Card className="divide-y">
        {options.map((option) => (
          <Link
            key={option.href}
            href={option.href}
            className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/60"
          >
            <span className="text-2xl">{option.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="font-medium">{option.title}</div>
              <div className="text-sm text-muted-foreground">{option.description}</div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </Card>

      <FooterMenu />
    </div>
  );
}
