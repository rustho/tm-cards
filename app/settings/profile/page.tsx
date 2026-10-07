"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ProfileSettings } from "./ProfileSettings";
import { Profile } from "@/models/types";
import { api, ApiError } from "@/lib/api";
import { FooterMenu } from "@/components/FooterMenu";

const EMPTY_PROFILE: Profile = {
  id: "",
  username: "",
  name: "",
  goal: "",
  country: "",
  region: "",
  interests: [],
  hobbies: [],
  personalityTraits: [],
  similarInterests: "",
  announcement: "",
  profile: "",
  placesToVisit: "",
  instagram: "",
  photo: "",
  dateOfBirth: "",
};

/** Loads the current user's profile and persists edits through POST /api/profile. */
export default function ProfileSettingsPage() {
  const t = useTranslations("settings.editProfile");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<Profile>("/api/profile")
      .then((data) => !cancelled && setProfile(data))
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setProfile(EMPTY_PROFILE);
        } else {
          console.error("Failed to load profile:", err);
          setError(t("loadFailed"));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

  const handleProfileUpdate = async (updated: Profile) => {
    setProfile(updated);
    try {
      const result = await api.post<{ success: boolean; profile: Profile }>("/api/profile", updated);
      setProfile(result.profile);
    } catch (err) {
      console.error("Failed to save profile:", err);
      setError(t("saveFailed"));
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
