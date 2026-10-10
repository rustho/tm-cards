"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { Profile } from "@/models/types";
import { useCachedApi } from "@/lib/apiCache";
import { formatDayMonth } from "@/lib/dateUtils";
import { getProfileTemplate } from "@/components/profile-templates";
import { Avatar } from "@/components/ui/avatar";
import { BackButton } from "@/components/ui/back-button";
import { MenuList, MenuRow } from "@/components/ui/menu-list";
import { FooterMenu } from "@/components/FooterMenu";
import { EDIT_STEPS } from "../ui/Wizard";

const FIELD_ICONS: Record<string, string> = {
  location: "📍",
  name: "👤",
  dateOfBirth: "🎂",
  occupation: "💼",
  values: "🧭",
  interests: "❤️",
  goal: "🎯",
  meetingFormat: "☕",
  about: "📝",
  photo: "📸",
  theme: "🎨",
};

/**
 * Questionnaire field list for a finished profile: each row shows the current value and opens
 * just that wizard step (/profile/edit/<step>). An unfinished profile goes back to onboarding.
 */
export default function EditProfilePage() {
  const router = useRouter();
  const t = useTranslations("profile.edit");
  const tGoal = useTranslations("profile.steps.goal.options");
  const tCard = useTranslations("profileCard.templates");
  const { data: profile, refreshing } = useCachedApi<Profile>("/api/profile", { allowNotFound: true });
  const unfinished = !refreshing && (profile === null || (profile !== undefined && !profile.isComplete));

  useEffect(() => {
    if (unfinished) router.replace("/profile");
  }, [unfinished, router]);

  const valueOf = (step: string, p: Profile): string => {
    switch (step) {
      case "location":
        return [p.country, p.region].filter(Boolean).join(", ");
      case "name":
        return p.name;
      case "dateOfBirth":
        return p.dateOfBirth ? `${formatDayMonth(p.dateOfBirth)} ${p.dateOfBirth.slice(0, 4)}` : "";
      case "occupation":
        return p.occupation;
      case "values":
        return p.values.join(", ");
      case "interests":
        return p.interests.join(", ");
      case "goal":
        return p.goals.map((id) => tGoal(`${id}.title`)).join(", ");
      case "meetingFormat":
        return p.meetingFormats.join(", ");
      case "about":
        return p.profile;
      case "photo":
        return p.photo ? t("photoSet") : "";
      case "theme":
        return tCard(getProfileTemplate(p.theme).id);
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-xl space-y-4 px-4 pb-28 pt-4">
        <BackButton />
        <div className="space-y-2">
          <h1 className="m-0 text-[28px] font-bold leading-9">{t("title")}</h1>
          <p className="m-0 text-body text-muted-foreground">{t("subtitle")}</p>
        </div>

        {!profile?.isComplete ? (
          <div className="flex justify-center py-12">
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <MenuList>
            {EDIT_STEPS.map(({ id }) => (
              <MenuRow
                key={id}
                icon={FIELD_ICONS[id] ?? "✏️"}
                label={t(`fields.${id}`)}
                description={valueOf(id, profile) || t("empty")}
                value={id === "photo" && profile.photo ? <Avatar name={profile.name} photo={profile.photo} className="size-10" /> : undefined}
                href={`/profile/edit/${id}`}
              />
            ))}
          </MenuList>
        )}
      </div>
      <FooterMenu />
    </div>
  );
}
