"use client";

import { useState, useEffect } from "react";
import { useSignal, initData } from "@telegram-apps/sdk-react";
import { Profile } from "@/models/types";
import { useTelegramMock } from "@/hooks/useTelegramMock";
import { FlexibleWizard } from "./FlexibleWizard";
import { ONBOARDING_STEPS } from "./wizardConfig";

export function Wizard() {
  const user = useSignal(initData.user);
  const [profileData, setProfileData] = useState<Partial<Profile>>({
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
  });

  useTelegramMock();

  // Get Telegram user info from SDK
  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        id: user.id.toString(),
        username: user.username || "",
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || prev.name,
      }));
    }
  }, [user]);

  // Function to save profile data to backend
  const saveProfile = async (data: Partial<Profile>) => {
    // Don't save if we don't have an ID
    const userId = data.id || profileData.id;
    if (!userId) return;

    try {
      const payload = { ...profileData, ...data, id: userId };
      await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Failed to save profile step:", error);
    }
  };

  const handleStepComplete = (stepId: string, data: Partial<Profile>) => {
    setProfileData((prev) => ({ ...prev, ...data }));
    saveProfile(data);
  };

  const handleComplete = (finalData: Profile) => {
    // Ensure everything is saved
    saveProfile(finalData).then(() => {
        if (typeof window !== "undefined") {
            window.location.href = "/";
        }
    });
  };

  return (
    <FlexibleWizard
      steps={ONBOARDING_STEPS}
      initialData={profileData}
      onStepComplete={handleStepComplete}
      onComplete={handleComplete}
      mode="full"
    />
  );
}
