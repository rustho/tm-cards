"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { Profile } from "@/models/types";
import { useCachedApi } from "@/lib/apiCache";
import { FooterMenu } from "@/components/FooterMenu";
import { BackButton } from "@/components/ui/back-button";
import { ProfileCard } from "@/components/profile-templates";

/** Another user's questionnaire, rendered with the card template they picked. */
export default function UserProfile() {
  const params = useParams<{ userId: string }>();
  const t = useTranslations("profile.view");
  const { data: profile, refreshing } = useCachedApi<Profile>(`/api/profile/${params.userId}`, { allowNotFound: true });
  const loading = profile === undefined && refreshing;

  return (
    <div className="mx-auto min-h-screen max-w-xl space-y-4 px-4 pb-28 pt-4">
      <BackButton />
      {loading ? (
        <p className="m-0 py-12 text-center text-body text-muted-foreground">{t("loading")}</p>
      ) : !profile ? (
        <p className="m-0 py-12 text-center text-body text-destructive">{t("notFound")}</p>
      ) : (
        <div className="overflow-hidden rounded-md border border-divider">
          <ProfileCard theme={profile.theme} profile={profile} />
        </div>
      )}
      <FooterMenu />
    </div>
  );
}
