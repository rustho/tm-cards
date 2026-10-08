"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CalendarDays, ChevronRight, MapPin, UserRound, UsersRound } from "lucide-react";
import type { CurrentMatch } from "@/models/types";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { openTgLink } from "@/lib/telegramLinks";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CelebrationScreen } from "./CelebrationScreen";
import { CountdownBoxes, CountdownPill } from "./Countdown";

type Overlay = "waiting" | "mutual" | "questionLocked" | null;

/**
 * «Встречи» tab in the `week` phase: this round's pair.
 * Before my click: timer + «Хочу познакомиться». Mine only: «Ждём ответ собеседника».
 * Both: «Написать», and «Поделиться впечатлением» FEEDBACK_OPENS_AFTER_HOURS later.
 */
export const WeekMatchView = ({ initial }: { initial: CurrentMatch }) => {
  const router = useRouter();
  const t = useTranslations("weekMatch");
  const [match, setMatch] = useState(initial);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const mutual = match.iAccepted && match.partnerAccepted;
  const name = match.partner.name;

  const accept = async () => {
    setSaving(true);
    setError(false);
    try {
      const updated = await api.post<CurrentMatch>(`/api/meetings/${match.matchId}/accept`, {});
      setMatch(updated);
      setOverlay(updated.partnerAccepted ? "mutual" : "waiting");
    } catch (e) {
      console.error("Error accepting match:", e);
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  const write = () => match.contactUrl && openTgLink(match.contactUrl);

  if (overlay === "waiting") {
    return (
      <CelebrationScreen
        me={match.me}
        partner={match.partner}
        aboveFooter
        title={t("waitingTitle")}
        text={t("waitingText", { name })}
        action={
          <Button variant="primary" size="block" onClick={() => setOverlay(null)}>
            {t("great")}
          </Button>
        }
      >
        <p className="m-0 pb-2 text-body text-muted-foreground">{t("timer")}</p>
        <CountdownBoxes deadline={match.deadline} />
      </CelebrationScreen>
    );
  }

  if (overlay === "mutual") {
    return (
      <CelebrationScreen
        me={match.me}
        partner={match.partner}
        aboveFooter
        title={t("mutualTitle")}
        text={t("mutualText")}
        action={
          <Button
            variant="primary"
            size="block"
            disabled={!match.contactUrl}
            onClick={() => {
              write();
              setOverlay(null);
            }}
          >
            <TelegramIcon />
            {t("write")}
          </Button>
        }
      >
        <CountdownBoxes deadline={match.deadline} />
      </CelebrationScreen>
    );
  }

  return (
    <div className="space-y-3">
      <header className="flex items-center gap-5 pb-2">
        <Avatar name={match.partner.name} photo={match.partner.photo} className="size-32 text-3xl" />
        <div className="min-w-0 space-y-2">
          <h1 className="m-0 truncate text-[32px] font-bold leading-10">{name}</h1>
          {match.partner.location && (
            <p className="m-0 flex items-center gap-1.5 text-counter text-muted-foreground">
              <MapPin className="size-5 shrink-0 fill-success text-success [&>circle]:fill-card" aria-hidden />
              {match.partner.location}
            </p>
          )}
        </div>
      </header>

      <Link
        href={`/profile/${match.partner.id}`}
        className="flex items-center justify-center gap-2 rounded-md border border-divider bg-card px-4 py-3.5 text-option text-primary"
      >
        <UserRound className="size-5" aria-hidden />
        <span className="flex-1 text-center">{t("openProfile")}</span>
        <ChevronRight className="size-5" aria-hidden />
      </Link>

      {match.vibes.length > 0 && (
        <Section icon={<UsersRound className="size-6 text-primary" aria-hidden />} title={t("vibes")}>
          {match.vibes.map((v) => (
            <Chip key={v.label} emoji={v.emoji} label={v.label} common />
          ))}
        </Section>
      )}

      {match.formats.length > 0 && (
        <Section icon={<CalendarDays className="size-6 text-primary" aria-hidden />} title={t("formats")}>
          {match.formats.map((f) => (
            <Chip key={f.label} emoji={f.emoji} label={f.label} common={f.common} />
          ))}
        </Section>
      )}

      <button
        type="button"
        onClick={() => (mutual ? router.push(`/meetings/${match.matchId}/question`) : setOverlay("questionLocked"))}
        className="flex w-full items-center gap-4 rounded-md border border-divider bg-card px-4 py-4 text-left"
      >
        <QuestionCardsArt />
        <span className="flex-1 text-counter text-muted-foreground">{t("questionTeaser")}</span>
        <ChevronRight className="size-6 text-primary" aria-hidden />
      </button>

      <section className="space-y-3 rounded-md border border-divider bg-card p-4 text-center">
        {match.iAccepted && !match.partnerAccepted ? (
          <>
            <CountdownPill deadline={match.deadline} icon />
            <p className="m-0 flex items-center justify-center gap-3 text-option">
              <span aria-hidden>⏳</span>
              {t("waitingPartner")}
            </p>
          </>
        ) : (
          <>
            <CountdownPill deadline={match.deadline} />
            <p className="m-0 text-body text-muted-foreground">{t("timeLeft")}</p>
            {mutual ? (
              <>
                <Button variant="primary" size="block" disabled={!match.contactUrl} onClick={write}>
                  {t("write")}
                </Button>
                {match.canShareFeedback && (
                  <Button asChild variant="outline" size="block" className="border-primary-light text-primary">
                    <Link href={`/home/meetings/${match.matchId}`}>{t("shareFeedback")}</Link>
                  </Button>
                )}
              </>
            ) : (
              <Button variant="primary" size="block" disabled={saving} onClick={accept}>
                {t("accept")}
              </Button>
            )}
            {error && <p className="m-0 text-body text-destructive">{t("acceptFailed")}</p>}
          </>
        )}
      </section>

      {overlay === "questionLocked" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-8" role="dialog" aria-modal>
          <div className="w-full max-w-sm space-y-4 rounded-md border border-primary-light bg-card p-5 text-center shadow-xl">
            <p className="m-0 text-counter">{t("questionLocked")}</p>
            <Button variant="primary" size="block" onClick={() => setOverlay(null)}>
              {t("ok")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-md border border-divider bg-card p-4">
      <h2 className="m-0 flex items-center gap-3 text-option font-semibold">
        {icon}
        {title}
      </h2>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

function Chip({ emoji, label, common }: { emoji: string; label: string; common: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-chip",
        common ? "bg-success-bg text-success" : "bg-muted text-muted-foreground"
      )}
    >
      <span aria-hidden>{emoji}</span>
      {label.toLowerCase()}
    </span>
  );
}

/** Two tilted question cards with «spark» strokes. */
function QuestionCardsArt() {
  return (
    <span className="relative block h-16 w-20 shrink-0" aria-hidden>
      <span className="absolute left-1 top-2 h-14 w-11 -rotate-12 rounded-md border border-divider bg-primary-muted" />
      <span className="absolute left-6 top-0 flex h-14 w-11 rotate-6 items-center justify-center rounded-md border border-divider bg-warning/10 text-[28px] font-bold text-warning">
        ?
      </span>
    </span>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden>
      <path d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.7.8l-4.7-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.8 8.8-7.9c.4-.3-.1-.5-.6-.2L6.6 13.3 2 11.9c-1-.3-1-1 .2-1.5L20.6 3.3c.8-.3 1.6.2 1.3 1z" />
    </svg>
  );
}
