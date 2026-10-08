"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { Profile } from "@/models/types";
import { api, ApiError } from "@/lib/api";
import { FooterMenu } from "@/components/FooterMenu";
import "./pageStyles.css";
import { MyProfileView } from "./ui/MyProfileView";
import { Wizard } from "./ui/Wizard";

/**
 * «Анкета» tab: my finished questionnaire («Редактировать анкету» reopens the wizard, prefilled),
 * or the onboarding wizard until it is complete. The wizard fills the screen above the fixed footer (pb-24).
 */
export default function ProfilePage() {
  const t = useTranslations("profile.wizard");
  // undefined = loading, null = no finished profile yet
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [reload, setReload] = useState(0);
  // Steps autosave, so leaving the editor (done or «Назад») always refetches the profile.
  const stopEditing = () => {
    setEditing(false);
    setReload((n) => n + 1);
  };

  useEffect(() => {
    let cancelled = false;
    api
      .get<Profile>("/api/profile")
      .then((data) => !cancelled && setProfile(data.isComplete ? data : null))
      .catch((error) => {
        if (!(error instanceof ApiError && error.status === 404)) console.error("Failed to load profile:", error);
        if (!cancelled) setProfile(null);
      });
    return () => {
      cancelled = true;
    };
  }, [reload]);

  if (profile === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center pb-24" aria-label={t("loading")}>
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <FooterMenu />
      </div>
    );
  }

  if (profile && !editing) {
    return (
      <div className="mx-auto min-h-screen max-w-xl px-4 pb-28 pt-4">
        <MyProfileView profile={profile} onEdit={() => setEditing(true)} />
        <FooterMenu />
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden px-4 pb-24">
      <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col">
        <Wizard onDone={editing ? stopEditing : undefined} onCancel={editing ? stopEditing : undefined} />
      </div>
      <FooterMenu />
    </div>
  );
}
