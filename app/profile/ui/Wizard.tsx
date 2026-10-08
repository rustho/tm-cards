"use client";

import { useEffect, useRef, useState } from "react";
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
  values: [],
  meetingFormats: [],
  similarInterests: "",
  announcement: "",
  profile: "",
  placesToVisit: "",
  instagram: "",
  photo: "",
  country: "",
  region: "",
  dateOfBirth: "",
  occupation: "",
  theme: "",
  goals: [],
};

/** Empty values (undefined, null, "", []) compare equal; everything else by JSON. */
function normalize(value: unknown): string {
  if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) return "";
  return JSON.stringify(value);
}

/** Fields of `data` that differ from what the server already has. */
function changedFields(data: Partial<Profile>, saved: Partial<Profile>): Partial<Profile> {
  const changed: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (normalize(value) !== normalize(saved[key as keyof Profile])) changed[key] = value;
  }
  return changed as Partial<Profile>;
}

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
  // What the server has, to send only changed fields (each DB round trip is slow).
  const savedRef = useRef<Partial<Profile>>({});

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
      savedRef.current = existing;
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

  // Saves are chained so they reach the server in order: otherwise a slow older
  // save can finish last and overwrite newer data. Each sends only changed fields.
  const saveQueue = useRef<Promise<unknown>>(Promise.resolve());

  const saveProfile = (data: Partial<Profile>, { force = false } = {}): Promise<boolean> => {
    const run = async () => {
      const changes = changedFields(data, savedRef.current);
      if (!force && Object.keys(changes).length === 0) return true;
      setSaveError(null);
      try {
        await api.post("/api/profile", referralCode ? { ...changes, referralCode } : changes);
        savedRef.current = { ...savedRef.current, ...changes };
        return true;
      } catch (error) {
        console.error("Failed to save profile:", error);
        setSaveError(error instanceof Error ? error.message : t("saveFailed"));
        return false;
      }
    };
    const result = saveQueue.current.then(run);
    saveQueue.current = result;
    return result;
  };

  const handleStepComplete = (_stepId: string, data: Partial<Profile>) => {
    void saveProfile(data);
  };

  const handleComplete = async (finalData: Profile) => {
    const ok = await saveProfile({ ...finalData, isComplete: true } as Partial<Profile>, { force: true });
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
