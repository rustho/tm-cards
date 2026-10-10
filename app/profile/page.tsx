"use client";

import { useTranslations } from "next-intl";
import type { Profile } from "@/models/types";
import { useCachedApi } from "@/lib/apiCache";
import { FooterMenu } from "@/components/FooterMenu";
import "./pageStyles.css";
import { MyProfileView } from "./ui/MyProfileView";
import { Wizard } from "./ui/Wizard";

/**
 * «Анкета» tab: my finished questionnaire («Редактировать анкету» → /profile/edit, field by field),
 * or the onboarding wizard until it is complete. Onboarding hides the footer (no tabs until the
 * questionnaire is done).
 */
export default function ProfilePage() {
  const t = useTranslations("profile.wizard");
  // Cached copy first, then the server's (lib/apiCache.ts).
  const { data, refreshing } = useCachedApi<Profile>("/api/profile", { allowNotFound: true });
  // undefined = loading, null = no finished profile yet
  const profile: Profile | null | undefined =
    data === undefined ? (refreshing ? undefined : null) : data?.isComplete ? data : null;

  if (profile === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center" aria-label={t("loading")}>
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (profile) {
    return (
      <div className="mx-auto min-h-screen max-w-xl px-4 pb-28 pt-4">
        <MyProfileView profile={profile} />
        <FooterMenu />
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden px-4 pb-4">
      <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col">
        <Wizard />
      </div>
    </div>
  );
}
