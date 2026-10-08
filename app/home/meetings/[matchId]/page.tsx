"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, Lock } from "lucide-react";
import {
  FEEDBACK_TEXT_MAX,
  IMPRESSION_OPTIONS,
  NOT_MET_REASONS,
  type ImpressionId,
  type MeetingDetails,
  type MeetingStatus,
  type NotMetReason,
} from "@/models/types";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { BackButton, Button, TextArea } from "@/components/ui";
import { BottomAction } from "@/components/meetings/BottomAction";
import { MeetingDoneScreen } from "@/components/meetings/MeetingDoneScreen";
import { MeetingPartnerHeader } from "@/components/meetings/MeetingPartnerHeader";

type Outcome = "met" | "later" | "not_met";
type Step = "outcome" | "met" | "not_met" | "waiting" | "later" | "closed" | "view";
type FeedbackBody =
  | { outcome: "met"; impressions: ImpressionId[]; text: string }
  | { outcome: "not_met"; reason: NotMetReason; text: string }
  | { outcome: "later" };

const OPEN_STATUSES: MeetingStatus[] = ["pending", "met", "postponed"];

const OUTCOMES: { value: Outcome; emoji: string }[] = [
  { value: "met", emoji: "🎉" },
  { value: "later", emoji: "🙏" },
  { value: "not_met", emoji: "😔" },
];

/** Where a (re)opened meeting starts: the partner's words first, then my form, then the matching final screen. */
function initialStep(meeting: MeetingDetails): Step {
  if (meeting.partnerFeedback) return "view";
  if (!meeting.myFeedback && OPEN_STATUSES.includes(meeting.status)) return "outcome";
  if (meeting.myFeedback?.met) return "waiting";
  return "closed";
}

/**
 * Leaving and reading meeting impressions.
 * outcome → met (chips + text) → waiting «Супер!» (or the partner's impression if it is already there);
 * outcome → later → «Супер!»; outcome → not_met (reason) → thank-you.
 */
export default function MeetingPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const t = useTranslations("meetings");
  const [meeting, setMeeting] = useState<MeetingDetails | null>(null);
  const [step, setStep] = useState<Step>("outcome");
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get<MeetingDetails>(`/api/meetings/${matchId}`)
      .then((data) => {
        if (cancelled) return;
        setMeeting(data);
        setStep(initialStep(data));
      })
      .catch((error) => {
        console.error("Error fetching meeting:", error);
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [matchId]);

  const submit = async (body: FeedbackBody) => {
    setSaving(true);
    setSaveFailed(false);
    try {
      const updated = await api.post<MeetingDetails>(`/api/meetings/${matchId}/feedback`, body);
      setMeeting(updated);
      if (body.outcome === "later") setStep("later");
      else if (body.outcome === "met") setStep(updated.partnerFeedback ? "view" : "waiting");
      else setStep("closed");
    } catch (error) {
      console.error("Error saving feedback:", error);
      setSaveFailed(true);
    } finally {
      setSaving(false);
    }
  };

  if (failed || !meeting) {
    return (
      <div className="mx-auto max-w-xl px-4 pt-4">
        <BackButton />
        {failed ? (
          <p className="m-0 py-12 text-center text-body text-muted-foreground">{t("loadFailed")}</p>
        ) : (
          <div className="flex justify-center py-12" aria-label={t("loading")}>
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>
    );
  }

  const name = meeting.partner.name;
  const formProps = { saving, saveFailed };

  return (
    <div className="mx-auto min-h-screen max-w-xl px-4 pb-28 pt-4">
      {step === "waiting" && <MeetingDoneScreen me={meeting.me} partner={meeting.partner} title={t("done.title")} text={t("done.waiting", { name })} />}
      {step === "later" && <MeetingDoneScreen me={meeting.me} partner={meeting.partner} title={t("done.title")} text={t("done.later")} />}
      {step === "closed" && (
        <MeetingDoneScreen
          me={meeting.me}
          partner={meeting.partner}
          title={t("done.thanks")}
          text={t(meeting.myFeedback?.reason === "report" ? "done.reported" : "done.notMet")}
        />
      )}

      {(step === "outcome" || step === "met" || step === "not_met" || step === "view") && (
        <div className="space-y-5">
          <BackButton onClick={step === "met" || step === "not_met" ? () => setStep(meeting.partnerFeedback ? "view" : "outcome") : undefined} />
          <MeetingPartnerHeader partner={meeting.partner} />
          {step === "outcome" && (
            <OutcomeStep
              canPostpone={meeting.status === "pending"}
              onNext={(outcome) => (outcome === "later" ? submit({ outcome }) : setStep(outcome))}
              {...formProps}
            />
          )}
          {step === "met" && <MetStep onSubmit={submit} {...formProps} />}
          {step === "not_met" && <NotMetStep onSubmit={submit} {...formProps} />}
          {step === "view" && (
            <ViewStep
              meeting={meeting}
              onAnswer={!meeting.myFeedback && OPEN_STATUSES.includes(meeting.status) ? () => setStep("met") : undefined}
            />
          )}
        </div>
      )}
    </div>
  );
}

interface FormProps {
  saving: boolean;
  saveFailed: boolean;
}

function StepTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="space-y-1 text-center">
      <h2 className="m-0 text-title">{title}</h2>
      {subtitle && <p className="m-0 text-counter text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function SaveError({ show }: { show: boolean }) {
  const t = useTranslations("meetings.form");
  return show ? <p className="m-0 text-center text-body text-destructive">{t("saveFailed")}</p> : null;
}

/** Screen 1: «Встреча состоялась?» — three big single-choice cards. */
function OutcomeStep({ canPostpone, onNext, saving, saveFailed }: FormProps & { canPostpone: boolean; onNext: (o: Outcome) => void }) {
  const t = useTranslations("meetings.form");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const options = OUTCOMES.filter((o) => o.value !== "later" || canPostpone);

  return (
    <>
      <StepTitle title={t("outcomeTitle")} subtitle={t("outcomeQuestion")} />
      <div className="space-y-3">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={outcome === o.value}
            onClick={() => setOutcome(o.value)}
            className={cn(
              "flex min-h-[72px] w-full items-center justify-center rounded-md border px-4 text-option shadow-sm transition-colors",
              outcome === o.value ? "border-primary bg-primary-muted" : "border-divider bg-card"
            )}
          >
            {t(`outcome.${o.value}`)} {o.emoji}
          </button>
        ))}
      </div>
      <SaveError show={saveFailed} />
      <BottomAction>
        <Button variant="primary" size="block" disabled={!outcome || saving} onClick={() => outcome && onNext(outcome)}>
          {t("submit")}
        </Button>
      </BottomAction>
    </>
  );
}

/** Screen 2: «Поделись своим состоянием» — multi-select chips, optional text, lock hint. */
function MetStep({ onSubmit, saving, saveFailed }: FormProps & { onSubmit: (body: FeedbackBody) => void }) {
  const t = useTranslations("meetings");
  const [selected, setSelected] = useState<ImpressionId[]>([]);
  const [text, setText] = useState("");

  const toggle = (id: ImpressionId) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <>
      <StepTitle title={t("form.metTitle")} subtitle={t("form.metSubtitle")} />
      <div className="-mx-1 grid grid-cols-2 gap-2">
        {IMPRESSION_OPTIONS.map((o) => {
          const on = selected.includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(o.id)}
              className={cn(
                "flex min-h-14 items-center gap-1.5 rounded-md border px-2.5 py-2 text-left text-caption transition-colors",
                on ? "border-success bg-success-bg" : "border-divider bg-card"
              )}
            >
              <span className="text-[18px] leading-none" aria-hidden>
                {o.emoji}
              </span>
              <span className="min-w-0 flex-1">{t(`impressions.${o.id}`)}</span>
              {on && (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
                  <Check className="size-3" strokeWidth={3} aria-hidden />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="space-y-2">
        <p className="m-0 text-counter">{t("form.textLabel")}</p>
        <TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={FEEDBACK_TEXT_MAX}
          placeholder={t("form.textPlaceholder")}
        />
      </div>
      <aside className="flex items-center gap-3 rounded-md border border-warning/30 bg-warning/10 p-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning">
          <Lock className="size-4" aria-hidden />
        </span>
        <p className="m-0 text-chip">{t("form.lockHint")}</p>
      </aside>
      <SaveError show={saveFailed} />
      <BottomAction>
        <Button
          variant="primary"
          size="block"
          disabled={selected.length === 0 || saving}
          onClick={() => onSubmit({ outcome: "met", impressions: selected, text })}
        >
          {t("form.submit")}
        </Button>
      </BottomAction>
    </>
  );
}

/** Screen 5: «Что-то пошло не так?» — one reason; «Другое» and the complaint ask for details. */
function NotMetStep({ onSubmit, saving, saveFailed }: FormProps & { onSubmit: (body: FeedbackBody) => void }) {
  const t = useTranslations("meetings");
  const [reason, setReason] = useState<NotMetReason | null>(null);
  const [text, setText] = useState("");
  const needsText = reason === "other" || reason === "report";

  return (
    <>
      <StepTitle title={t("form.notMetTitle")} />
      <div className="space-y-2">
        {NOT_MET_REASONS.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={reason === o.id}
            onClick={() => setReason(o.id)}
            className={cn(
              "flex w-full items-center gap-4 rounded-md border p-2 text-left text-counter transition-colors",
              reason === o.id ? "border-primary bg-primary-muted" : "border-divider bg-card"
            )}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-muted/60 text-[20px]" aria-hidden>
              {o.emoji}
            </span>
            {t(`reasons.${o.id}`)}
          </button>
        ))}
      </div>
      {needsText && (
        <TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={FEEDBACK_TEXT_MAX}
          placeholder={t(reason === "report" ? "form.reportPlaceholder" : "form.otherPlaceholder")}
        />
      )}
      <SaveError show={saveFailed} />
      <BottomAction>
        <Button
          variant="primary"
          size="block"
          disabled={!reason || saving}
          onClick={() => reason && onSubmit({ outcome: "not_met", reason, text: needsText ? text : "" })}
        >
          {t("form.submit")}
        </Button>
      </BottomAction>
    </>
  );
}

/** Screen 6: the partner's impression of me; «Поделиться в ответ» while mine is missing. */
function ViewStep({ meeting, onAnswer }: { meeting: MeetingDetails; onAnswer?: () => void }) {
  const t = useTranslations("meetings");
  const feedback = meeting.partnerFeedback!;
  const chips = IMPRESSION_OPTIONS.filter((o) => feedback.impressions.includes(o.id));

  return (
    <>
      <h2 className="m-0 text-[26px] font-bold leading-8">{t("view.title")}</h2>
      {chips.length > 0 && (
        <ul className="m-0 list-none space-y-2 rounded-md border border-divider bg-card p-3">
          {chips.map((o) => (
            <li key={o.id} className="flex items-center gap-3 rounded-md border border-divider px-3 py-3 text-counter">
              <span className="text-[22px] leading-none" aria-hidden>
                {o.emoji}
              </span>
              {t(`impressions.${o.id}`)}
            </li>
          ))}
        </ul>
      )}
      {feedback.text && (
        <p className="m-0 whitespace-pre-line rounded-md border border-divider bg-card p-4 text-counter">{feedback.text}</p>
      )}
      {onAnswer && (
        <BottomAction>
          <Button variant="primary" size="block" onClick={onAnswer}>
            {t("view.answer")}
          </Button>
        </BottomAction>
      )}
    </>
  );
}
