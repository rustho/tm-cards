"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ProfileSettings } from "./ProfileSettings";
import { Profile } from "@/models/types";
import { api } from "@/lib/api";
import { useCachedApi, writeCache } from "@/lib/apiCache";
import { FooterMenu } from "@/components/FooterMenu";

const EMPTY_PROFILE: Profile = {
  id: "",
  username: "",
  name: "",
  goals: [],
  country: "",
  region: "",
  interests: [],
  values: [],
  meetingFormats: [],
  similarInterests: "",
  announcement: "",
  profile: "",
  placesToVisit: "",
  instagram: "",
  photo: "",
  dateOfBirth: "",
  occupation: "",
  theme: "",
};

/** Loads the current user's profile and persists edits through POST /api/profile. */
export default function ProfileSettingsPage() {
  const t = useTranslations("settings.editProfile");
  const { data, error: loadError } = useCachedApi<Profile>("/api/profile", { allowNotFound: true });
  const profile = data === null ? EMPTY_PROFILE : data;
  const [saveError, setSaveError] = useState<string | null>(null);
  const error = saveError ?? (profile === undefined && loadError ? t("loadFailed") : null);

  const handleProfileUpdate = async (updated: Profile) => {
    writeCache("/api/profile", updated);
    try {
      const result = await api.post<{ success: boolean; profile: Profile }>("/api/profile", updated);
      writeCache("/api/profile", result.profile);
    } catch (err) {
      console.error("Failed to save profile:", err);
      setSaveError(t("saveFailed"));
    }
  };

  if (error) {
    return (
      <div className="container p-8 text-center text-destructive">
        {error}
        <FooterMenu />
      </div>
    );
  }

  if (!profile) {
    return <div className="container p-8 text-center">{t("loading")}</div>;
  }

  return (
    <div className="settings-page pb-24">
      <ProfileSettings key={profile.id} initialProfile={profile} onProfileUpdate={handleProfileUpdate} />
      <FooterMenu />
    </div>
  );
}
