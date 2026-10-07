"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { initData, useLaunchParams, useSignal } from "@tma.js/sdk-react";
import { Profile } from "@/models/types";
import { api, ApiError } from "@/lib/api";
import { FlexibleWizard } from "./FlexibleWizard";
import { ONBOARDING_STEPS } from "./wizardConfig";

const EMPTY_PROFILE: Partial<Profile> = {
  id: "",
  username: "",
  name: "",
  interests: [],
  hobbies: [],
  personalityTraits: [],
  similarInterests: "",
  announcement: "",
  profile: "",
  placesToVisit: "",
  instagram: "",
  photo: "",
  country: "",
  region: "",
  dateOfBirth: "",
  goal: "",
};

/**
 * Onboarding entry point. Loads the existing profile (if any), seeds name and
 * username from Telegram, and autosaves every completed step to POST /api/profile.
 */
export function Wizard() {
  const router = useRouter();
  const t = useTranslations("profile.wizard");
  const user = useSignal(initData.user);
  const launchParams = useLaunchParams();
  // Deep links look like t.me/<bot>/<app>?startapp=ref_<code>
  const startParam = launchParams.tgWebAppStartParam ?? "";
  const referralCode = startParam.startsWith("ref_") ? startParam.slice(4) : undefined;
  const [initialData, setInitialData] = useState<Partial<Profile> | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let existing: Partial<Profile> = {};
      try {
        existing = await api.get<Profile>("/api/profile");
      } catch (error) {
        if (!(error instanceof ApiError && error.status === 404)) {
          console.error("Failed to load profile:", error);
        }
      }
      if (cancelled) return;
      setInitialData({
        ...EMPTY_PROFILE,
        ...existing,
        id: user ? String(user.id) : existing.id ?? "",
        username: existing.username || user?.username || "",
        name: existing.name || [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "",
      });
    })();
    return () => {
      cancelled = true;
    };
    // `user` from useSignal may change identity on every render; only the id matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const saveProfile = async (data: Partial<Profile>) => {
    setSaveError(null);
    try {
      await api.post("/api/profile", referralCode ? { ...data, referralCode } : data);
      return true;
    } catch (error) {
      console.error("Failed to save profile:", error);
      setSaveError(error instanceof Error ? error.message : t("saveFailed"));
      return false;
    }
  };

  const handleStepComplete = (_stepId: string, data: Partial<Profile>) => {
    void saveProfile(data);
  };

  const handleComplete = async (finalData: Profile) => {
    const ok = await saveProfile({ ...finalData, isComplete: true } as Partial<Profile>);
    if (ok) router.push("/home");
  };

  if (!initialData) {
    return <div className="root__loading">{t("loading")}</div>;
  }

  return (
    <>
      {saveError && (
        <div className="mx-4 mt-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {saveError}
        </div>
      )}
      <FlexibleWizard
        steps={ONBOARDING_STEPS}
        initialData={initialData}
        onStepComplete={handleStepComplete}
        onComplete={handleComplete}
        mode="full"
      />
    </>
  );
}
