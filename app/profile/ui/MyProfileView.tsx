"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { MEETING_FORMAT_OPTIONS, type Profile } from "@/models/types";
import { ProfileCard } from "@/components/profile-templates";
import { Button } from "@/components/ui/button";

const FORMAT_EMOJI = new Map<string, string>(MEETING_FORMAT_OPTIONS.map((o) => [o.label, o.emoji]));

/** «Анкета» tab once the wizard is done: my card in its template, city, meeting formats, «Редактировать» (→ /profile/edit). */
export function MyProfileView({ profile }: { profile: Profile }) {
  const t = useTranslations("profile.mine");
  const location = [profile.country, profile.region].filter(Boolean).join(", ");

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-md border border-divider">
        <ProfileCard theme={profile.theme} profile={profile} />
      </div>

      {location && (
        <section className="flex items-center gap-3 rounded-md border border-divider bg-card px-4 py-4 text-option">
          <span aria-hidden>📍</span>
          {location}
        </section>
      )}

      {profile.meetingFormats.length > 0 && (
        <section className="space-y-3 rounded-md border border-divider bg-card p-4">
          <h2 className="m-0 text-title">{t("formats")}</h2>
          <div className="flex flex-wrap gap-2">
            {profile.meetingFormats.map((format) => (
              <span key={format} className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-chip">
                <span aria-hidden>{FORMAT_EMOJI.get(format) ?? "✨"}</span>
                {format}
              </span>
            ))}
          </div>
        </section>
      )}

      <Button asChild variant="primary" size="block">
        <Link href="/profile/edit">{t("edit")}</Link>
      </Button>
    </div>
  );
}
