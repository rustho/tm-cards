"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Profile } from "@/models/types";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { FooterMenu } from "@/components/FooterMenu";
import { Card, CardContent } from "@/components/ui/card";
import { calculateAge } from "@/lib/dateUtils";

function Tags({ items, className }: { items: string[]; className?: string }) {
  if (items.length === 0) return <p className="text-muted-foreground">—</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className={`rounded-full px-3 py-1 text-sm ${className ?? "bg-primary/15 text-foreground"}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

export default function UserProfile() {
  const params = useParams<{ userId: string }>();
  const { userId: ownId } = useAuth();
  const t = useTranslations("profile.view");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get<Profile>(`/api/profile/${params.userId}`)
      .then((data) => !cancelled && setProfile(data))
      .catch((error) => console.error("Error fetching profile:", error))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [params.userId]);

  if (loading) {
    return <div className="container p-8 text-center">{t("loading")}</div>;
  }

  if (!profile) {
    return (
      <div className="container p-8 text-center text-destructive">
        {t("notFound")}
        <FooterMenu />
      </div>
    );
  }

  const age = (() => {
    try {
      return profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : null;
    } catch {
      return null;
    }
  })();
  const instagram = profile.instagram?.replace(/^@/, "");
  const isOwn = ownId === params.userId;

  return (
    <div className="container p-4 pb-24">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-start gap-6 sm:flex-row">
            {profile.photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photo} alt={profile.name} className="h-32 w-32 rounded-full object-cover" />
            )}
            <div className="flex-1 space-y-5">
              <div>
                <h1 className="mb-1 text-2xl font-bold">
                  {profile.name}
                  {age !== null && <span className="ml-2 text-lg font-normal text-muted-foreground">{age}</span>}
                </h1>
                {profile.goal && <p className="text-sm text-muted-foreground">{t("goal")}: {profile.goal}</p>}
              </div>

              <Section title={t("location")}>
                <p>{[profile.region, profile.country].filter(Boolean).join(", ") || "—"}</p>
              </Section>

              {profile.profile && (
                <Section title={t("about")}>
                  <p className="whitespace-pre-line">{profile.profile}</p>
                </Section>
              )}

              <Section title={t("personality")}>
                <Tags items={profile.personalityTraits ?? []} className="bg-secondary text-secondary-foreground" />
              </Section>

              <Section title={t("interests")}>
                <Tags items={profile.interests ?? []} className="bg-accent/30 text-foreground" />
              </Section>

              <Section title={t("hobbies")}>
                <Tags items={profile.hobbies ?? []} className="bg-primary/15 text-foreground" />
              </Section>

              {profile.placesToVisit && (
                <Section title={t("travelStyle")}>
                  <p>{profile.placesToVisit}</p>
                </Section>
              )}

              {instagram && (
                <Section title={t("instagram")}>
                  <a
                    href={`https://instagram.com/${instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    @{instagram}
                  </a>
                </Section>
              )}

              {profile.announcement && (
                <Section title={t("lookingFor")}>
                  <p className="whitespace-pre-line">{profile.announcement}</p>
                </Section>
              )}

              {!isOwn && instagram && (
                <a
                  href={`https://instagram.com/${instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="theme-btn-primary mt-2"
                >
                  {t("writeToMatch")}
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <FooterMenu />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      {children}
    </div>
  );
}
