"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { Profile } from "@/models/types";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { FooterMenu } from "@/components/FooterMenu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const router = useRouter();
  const t = useTranslations("home");
  const { userId } = useAuth();
  const [matches, setMatches] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    api
      .get<Profile[]>(`/api/matches/${userId}`)
      .then((data) => !cancelled && setMatches(Array.isArray(data) ? data : []))
      .catch((error) => {
        console.error("Error fetching matches:", error);
        if (!cancelled) setMatches([]);
      })
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card>
          <CardContent className="flex items-center gap-3 p-6">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p>{t("loading")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl p-6 pb-24">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">🎯 {t("title")}</h1>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="space-y-4">
          {matches.map((match) => (
            <Card
              key={match.id}
              role="button"
              tabIndex={0}
              className="cursor-pointer transition-transform hover:-translate-y-0.5"
              onClick={() => router.push(`/profile/${match.id}`)}
              onKeyDown={(e) => e.key === "Enter" && router.push(`/profile/${match.id}`)}
            >
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  {match.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={match.photo} alt={match.name} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                      {(match.name || match.id).slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="mb-1 text-xl font-semibold">{match.name || `${t("matchNumber")}${match.id.slice(-6)}`}</h2>
                    <p className="text-sm text-muted-foreground">
                      {[match.region, match.country].filter(Boolean).join(", ") || t("clickToExplore")}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}

          {matches.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="mb-4 text-6xl">🌟</div>
                <h3 className="mb-2 text-xl font-semibold">{t("noMatchesTitle")}</h3>
                <p className="text-muted-foreground">{t("noMatches")}</p>
                <Button asChild className="mt-6">
                  <Link href="/profile">{t("completeProfile")}</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <FooterMenu />
    </div>
  );
}
