"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { HomeSummary } from "@/models/types";
import { useCachedApi } from "@/lib/apiCache";
import { FooterMenu } from "@/components/FooterMenu";
import { Button } from "@/components/ui/button";
import { MeetingList } from "@/components/meetings/MeetingList";
import { StatCard } from "@/components/meetings/StatCard";
import { FeedbackHintBanner } from "@/components/meetings/FeedbackHintBanner";

/**
 * «Люди» tab. With access (subscription or trial): optional feedback hint, meeting history, counters.
 * Without access: a headline instead of the hint and a «Выбрать подписку» button at the bottom.
 */
export default function Home() {
  const t = useTranslations("home");
  const { data: summary, error } = useCachedApi<HomeSummary>("/api/home");
  const failed = !summary && !!error;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-xl space-y-3 px-4 pb-28 pt-4">
        {failed ? (
          <p className="m-0 py-12 text-center text-body text-muted-foreground">{t("loadFailed")}</p>
        ) : !summary ? (
          <div className="flex justify-center py-12" aria-label={t("loading")}>
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {summary.hasAccess ? (
              summary.awaitingFeedback > 0 && <FeedbackHintBanner />
            ) : (
              <h1 className="m-0 pb-2 text-[26px] font-bold leading-8">{t("headline")}</h1>
            )}

            <MeetingList title={t("history")} meetings={summary.history} />
            <StatCard
              title={t("myMeetings")}
              count={summary.meetings.count}
              people={summary.meetings.people}
              href="/home/meetings"
            />
            <StatCard
              title={t("invited")}
              count={summary.invited.count}
              people={summary.invited.people}
              href="/invitations"
            />

            {!summary.hasAccess && (
              <Button asChild variant="primary" size="block" className="mt-3">
                <Link href="/settings/subscription">{t("chooseSubscription")}</Link>
              </Button>
            )}
          </>
        )}
      </div>
      <FooterMenu showReminder />
    </div>
  );
}
