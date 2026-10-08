"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { Meeting } from "@/models/types";
import { api } from "@/lib/api";
import { FooterMenu } from "@/components/FooterMenu";
import { BackButton } from "@/components/ui/back-button";
import { MeetingList } from "@/components/meetings/MeetingList";

/** Full meeting log, opened from «Мои встречи» on the home tab. */
export default function MeetingsLog() {
  const t = useTranslations("meetings");
  const [meetings, setMeetings] = useState<Meeting[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get<Meeting[]>("/api/meetings")
      .then((data) => !cancelled && setMeetings(data))
      .catch((error) => {
        console.error("Error fetching meetings:", error);
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-xl space-y-4 px-4 pb-28 pt-4">
        <BackButton />
        {failed ? (
          <p className="m-0 py-12 text-center text-body text-muted-foreground">{t("loadFailed")}</p>
        ) : !meetings ? (
          <div className="flex justify-center py-12" aria-label={t("loading")}>
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <MeetingList title={t("allTitle")} meetings={meetings} />
        )}
      </div>
      <FooterMenu />
    </div>
  );
}
