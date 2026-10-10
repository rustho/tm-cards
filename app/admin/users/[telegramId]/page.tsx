"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { useCachedApi } from "@/lib/apiCache";
import { openTgLink } from "@/lib/telegramLinks";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TextArea } from "@/components/ui/text-area";
import { AdminPage, ConfirmButton, ErrorText, LoadError, Loading, Panel, Section, errorMessage, formatDate } from "@/components/admin/AdminUI";
import { BotDialog } from "@/components/admin/BotDialog";
import { MatchCard } from "@/components/admin/MatchCard";
import { UserBadges } from "@/components/admin/UserBadges";
import { cn } from "@/lib/utils";
import { MESSAGE_MAX_LENGTH, USER_STATUSES, type AdminEvent, type AdminUserAction, type AdminUserDetails } from "@/models/admin";

const GRANT_WEEKS = [1, 4, 12];

/** `/admin/users/[telegramId]`: questionnaire, access, status, bot message, meetings and event log. */
export default function AdminUserCard({ params }: { params: { telegramId: string } }) {
  const t = useTranslations("admin.user");
  const locale = useLocale();
  const url = `/api/admin/users/${params.telegramId}`;
  const { data: user, error, refresh, mutate } = useCachedApi<AdminUserDetails>(url);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [dialogVersion, setDialogVersion] = useState(0);

  const act = async (body: AdminUserAction) => {
    setBusy(true);
    setActionError(null);
    try {
      mutate(await api.post<AdminUserDetails>(url, body));
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (!user) {
    return <AdminPage title={t("title")}>{error ? <LoadError onRetry={refresh} /> : <Loading />}</AdminPage>;
  }

  const date = (iso: string | null) => formatDate(iso, locale);
  const facts: [string, ReactNode][] = [
    [t("telegramId"), user.telegramId],
    [t("joined"), date(user.createdAt)],
    [t("lastSeen"), formatDate(user.lastSeenAt, locale, true)],
    [t("completedAt"), date(user.completedAt)],
    [t("place"), user.place || "—"],
    [t("occupation"), user.occupation || "—"],
    [t("dateOfBirth"), user.dateOfBirth || "—"],
    [t("gender"), user.gender || "—"],
    [t("participating"), user.participating ? t("yes") : t("no")],
    [
      t("referrer"),
      user.referrer ? (
        <Link href={`/admin/users/${user.referrer.telegramId}`} className="text-primary hover:underline">
          {user.referrer.name}
        </Link>
      ) : (
        "—"
      ),
    ],
    [t("referrals"), user.referrals],
  ];
  const tagGroups: [string, string[]][] = [
    [t("interests"), user.interests],
    [t("values"), user.values],
    [t("formats"), user.meetingFormats],
    [t("goals"), user.goals],
  ];

  return (
    <AdminPage title={user.name}>
      <Panel className="flex items-start gap-3">
        <Avatar name={user.name} photo={user.photo} className="size-16" />
        <div className="min-w-0 flex-1 space-y-1.5">
          {user.username && (
            <button type="button" className="block text-body text-primary hover:underline" onClick={() => openTgLink(`https://t.me/${user.username}`)}>
              @{user.username}
            </button>
          )}
          <UserBadges user={user} />
          {user.profile !== "none" && (
            <Link href={`/profile/${user.telegramId}`} className="inline-block text-caption text-primary hover:underline">
              {t("openCard")}
            </Link>
          )}
        </div>
      </Panel>

      <Section title={t("info")}>
        <Panel className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
          {facts.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3 text-body">
              <span className="text-muted-foreground">{label}</span>
              <span className="min-w-0 truncate text-right text-foreground">{value}</span>
            </div>
          ))}
        </Panel>
        {(user.about || tagGroups.some(([, tags]) => tags.length > 0)) && (
          <Panel className="space-y-2">
            {user.about && <p className="m-0 whitespace-pre-line text-body text-foreground">{user.about}</p>}
            {tagGroups.map(
              ([label, tags]) =>
                tags.length > 0 && (
                  <div key={label} className="text-caption">
                    <span className="text-muted-foreground">{label}: </span>
                    <span className="text-foreground">{tags.join(", ")}</span>
                  </div>
                )
            )}
          </Panel>
        )}
      </Section>

      <Section title={t("access")}>
        <Panel className="space-y-3">
          <div className="text-body text-muted-foreground">{t("trialEnds", { date: date(user.trialEndsAt) })}</div>
          {user.subscriptions.length > 0 && (
            <ul className="m-0 list-none space-y-1 p-0 text-body">
              {user.subscriptions.map((s) => (
                <li key={s.id} className={cn("flex justify-between gap-2", s.status !== "active" && "text-muted-foreground line-through")}>
                  <span>{s.plan}</span>
                  <span>
                    {date(s.startedAt)} → {date(s.endsAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-body text-foreground">{t("grant")}</span>
            {GRANT_WEEKS.map((weeks) => (
              <ConfirmButton key={weeks} variant="outline" size="sm" disabled={busy} onConfirm={() => act({ action: "grantAccess", weeks })}>
                {t("weeks", { count: weeks })}
              </ConfirmButton>
            ))}
            {user.access.kind === "subscription" && (
              <ConfirmButton variant="ghost" size="sm" className="text-destructive" disabled={busy} onConfirm={() => act({ action: "revokeAccess" })}>
                {t("revoke")}
              </ConfirmButton>
            )}
          </div>
        </Panel>
      </Section>

      <Section title={t("statusTitle")}>
        <Panel className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {USER_STATUSES.map((status) => (
              <ConfirmButton
                key={status}
                variant={user.status === status ? "default" : "outline"}
                size="sm"
                disabled={busy || user.status === status}
                onConfirm={() => act({ action: "setStatus", status })}
              >
                {t(`status.${status}`)}
              </ConfirmButton>
            ))}
          </div>
          <p className="m-0 text-caption text-muted-foreground">{t("statusHint")}</p>
        </Panel>
        <ErrorText>{actionError}</ErrorText>
      </Section>

      <Section title={t("dialog")}>
        <BotDialog telegramId={user.telegramId} version={dialogVersion} />
        <MessageForm
          telegramId={user.telegramId}
          blocked={user.botBlocked}
          onSent={() => {
            refresh();
            setDialogVersion((v) => v + 1);
          }}
        />
      </Section>

      <Section title={t("matches", { count: user.matches.length })}>
        {user.matches.length === 0 ? (
          <p className="m-0 text-body text-muted-foreground">{t("noMatches")}</p>
        ) : (
          <div className="space-y-2">
            {user.matches.map((m) => (
              <MatchCard key={m.matchId} match={m} showWeek />
            ))}
          </div>
        )}
      </Section>

      <Section title={t("events")}>
        {user.events.length === 0 ? (
          <p className="m-0 text-body text-muted-foreground">{t("noEvents")}</p>
        ) : (
          <EventLog events={user.events} />
        )}
      </Section>
    </AdminPage>
  );
}

function MessageForm({ telegramId, blocked, onSent }: { telegramId: string; blocked: boolean; onSent: () => void }) {
  const t = useTranslations("admin.user");
  const [text, setText] = useState("");
  const [withAppButton, setWithAppButton] = useState(true);
  const [state, setState] = useState<{ kind: "idle" | "sending" | "sent" } | { kind: "error"; message: string }>({ kind: "idle" });

  const send = async () => {
    setState({ kind: "sending" });
    try {
      const result = await api.post<{ ok: boolean; error?: string }>(`/api/admin/users/${telegramId}/message`, { text, withAppButton });
      if (result.ok) {
        setText("");
        setState({ kind: "sent" });
      } else {
        setState({ kind: "error", message: result.error ?? t("sendFailed") });
      }
      onSent();
    } catch (e) {
      setState({ kind: "error", message: errorMessage(e) });
    }
  };

  return (
    <Panel className="space-y-3">
      {blocked && <p className="m-0 text-caption text-destructive">{t("blockedHint")}</p>}
      <TextArea value={text} onChange={(e) => setText(e.target.value)} maxLength={MESSAGE_MAX_LENGTH} placeholder={t("messagePlaceholder")} />
      <p className="m-0 text-caption text-muted-foreground">{t.raw("messageHint") as string}</p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-body text-foreground">
          <Switch checked={withAppButton} onCheckedChange={setWithAppButton} />
          {t("withAppButton")}
        </label>
        <Button onClick={send} disabled={!text.trim() || state.kind === "sending"}>
          {state.kind === "sending" ? t("sending") : t("send")}
        </Button>
      </div>
      {state.kind === "sent" && <p className="m-0 text-caption text-success">{t("sent")}</p>}
      {state.kind === "error" && <ErrorText>{state.message}</ErrorText>}
    </Panel>
  );
}

function EventLog({ events }: { events: AdminEvent[] }) {
  const t = useTranslations("admin.events");
  const locale = useLocale();
  const describe = (props: AdminEvent["props"]) =>
    props
      ? Object.entries(props)
          .map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`)
          .join(" · ")
      : "";
  return (
    <ul className="m-0 list-none divide-y divide-divider overflow-hidden rounded-md border border-divider bg-card p-0">
      {events.map((event) => (
        <li key={event.id} className="space-y-0.5 px-3 py-2">
          <div className="flex justify-between gap-2 text-body">
            <span className="text-foreground">{t.has(event.name) ? t(event.name) : event.name}</span>
            <span className="shrink-0 text-caption text-muted-foreground">{formatDate(event.createdAt, locale, true)}</span>
          </div>
          {event.props && <div className="break-words text-caption text-muted-foreground">{describe(event.props)}</div>}
        </li>
      ))}
    </ul>
  );
}
