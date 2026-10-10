"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Pause, Play } from "lucide-react";
import type { MeetingsWeek, Profile } from "@/models/types";
import { api } from "@/lib/api";
import { useCachedApi } from "@/lib/apiCache";
import { cn } from "@/lib/utils";
import { FooterMenu } from "@/components/FooterMenu";
import { Button } from "@/components/ui/button";
import { BottomAction, BottomActionAboveFooter } from "@/components/meetings/BottomAction";
import { MeetingFeedbackFlow } from "@/components/meetings/MeetingFeedbackFlow";
import { LocationPicker } from "@/components/meetings/LocationPicker";
import { PixelPeople } from "@/components/meetings/PixelPeople";
import { WeekMatchView } from "@/components/meetings/WeekMatchView";

/**
 * «Встречи» tab.
 * - No access: the opt-in screen, but «Участвую» and «Выбрать подписку» both lead to the subscription page.
 * - Access, `signup` phase: «Участвую» ⇄ «Пропускаю неделю» for Monday's matching.
 * - Access, `week` phase: this round's pair (`WeekMatchView`), or a note when there is none.
 * - Access, `feedback` phase (timer over, before sign-up): the impression flow for this round's pair.
 * Phases come from the server (WEEK_SCHEDULE in config/constants.ts).
 * Without a finished questionnaire matching skips the user, so this tab sends them to onboarding.
 */
export default function MeetingsTab() {
  const router = useRouter();
  const t = useTranslations("meetingsTab");
  // Cached copy first (instant), then the server's; see lib/apiCache.ts.
  const { data: week, error, mutate } = useCachedApi<MeetingsWeek>("/api/meetings/current");
  const failed = !week && !!error;
  const profile = useCachedApi<Profile>("/api/profile", { allowNotFound: true });

  // Only on the server's answer: a stale cached copy must not bounce a finished user.
  useEffect(() => {
    if (!profile.refreshing && !profile.error && !profile.data?.isComplete) router.replace("/profile");
  }, [profile.data, profile.error, profile.refreshing, router]);
  const [saving, setSaving] = useState(false);

  const toggle = async () => {
    if (!week) return;
    if (!week.hasAccess) return router.push("/settings/subscription");
    const participating = !week.participating;
    setSaving(true);
    mutate({ ...week, participating });
    try {
      await api.put("/api/meetings/participation", { participating });
    } catch (error) {
      console.error("Error updating participation:", error);
      mutate(week);
    } finally {
      setSaving(false);
    }
  };

  // Without access the button is shown in its inviting «Участвую» state.
  const on = week ? !week.hasAccess || week.participating : true;

  return (
    <div className="min-h-screen">
      <div className={cn("mx-auto max-w-xl px-4 pb-48", week?.match ? "pt-4" : "pt-10")}>
        {failed ? (
          <p className="m-0 py-12 text-center text-body text-muted-foreground">{t("loadFailed")}</p>
        ) : !week ? (
          <div className="flex justify-center py-12" aria-label={t("loading")}>
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : week.hasAccess && week.phase === "week" && week.match ? (
          <WeekMatchView initial={week.match} />
        ) : week.hasAccess && week.phase === "feedback" && week.match ? (
          <BottomActionAboveFooter>
            <MeetingFeedbackFlow matchId={week.match.matchId} embedded />
          </BottomActionAboveFooter>
        ) : week.hasAccess && week.phase !== "signup" ? (
          <section className="space-y-4 text-center">
            <PixelPeople className="mx-auto h-20 w-24" />
            <h1 className="m-0 text-[28px] font-medium leading-9">{t("weekTitle")}</h1>
            <p className="m-0 text-body text-muted-foreground">{t("weekText")}</p>
            <Button asChild variant="outline">
              <Link href="/home">{t("weekLink")}</Link>
            </Button>
          </section>
        ) : (
          <section className="flex flex-col items-center gap-6 text-center">
            <PixelPeople className="h-20 w-24" />
            <LocationPicker initial={week.location} />
            <h1 className="m-0 text-[32px] font-medium leading-10">{t("signupTitle")}</h1>
            <p className="m-0 -mt-2 text-body text-muted-foreground">{t("signupHint")}</p>
            <button
              type="button"
              onClick={toggle}
              disabled={saving}
              aria-pressed={on}
              className="group flex flex-col items-center gap-3 disabled:opacity-70"
            >
              <span
                className={cn(
                  "flex size-36 items-center justify-center rounded-xl border-2 shadow-[inset_0_-6px_0_rgba(0,0,0,0.08)] transition-transform group-active:translate-y-0.5",
                  on ? "border-success bg-success-bg text-success" : "border-destructive bg-destructive/10 text-destructive"
                )}
              >
                {on ? (
                  <Play className="size-14 fill-current" strokeWidth={1} />
                ) : (
                  <Pause className="size-14 fill-current" strokeWidth={1} />
                )}
              </span>
              <span className={cn("text-option", on ? "text-success" : "text-destructive")}>
                {t(on ? "participating" : "skipping")}
              </span>
            </button>
          </section>
        )}

        {week && !week.hasAccess && (
          <BottomAction aboveFooter>
            <Button asChild variant="primary" size="block">
              <Link href="/settings/subscription">{t("chooseSubscription")}</Link>
            </Button>
          </BottomAction>
        )}
      </div>
      <FooterMenu />
    </div>
  );
}
