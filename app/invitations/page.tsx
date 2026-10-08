"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { shareURL } from "@tma.js/sdk-react";
import { BadgePercent, Crown, Mail, UserRound } from "lucide-react";
import type { InvitationsSummary } from "@/models/types";
import { REFERRAL_BONUS_WEEKS, REFERRAL_FRIEND_DISCOUNT_PERCENT } from "@/config/constants";
import { api } from "@/lib/api";
import { FooterMenu } from "@/components/FooterMenu";
import { Avatar, Button } from "@/components/ui";
import { BottomAction } from "@/components/meetings/BottomAction";

const rewards = { weeks: REFERRAL_BONUS_WEEKS, discount: REFERRAL_FRIEND_DISCOUNT_PERCENT };

/**
 * «Приглашения» tab. Paid subscribers share their referral link and see who joined;
 * everyone else (no subscription or the trial month) sees the rewards and «Выбрать подписку».
 */
export default function Invitations() {
  const t = useTranslations("invitations");
  const [summary, setSummary] = useState<InvitationsSummary | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get<InvitationsSummary>("/api/invitations")
      .then((data) => !cancelled && setSummary(data))
      .catch((error) => {
        console.error("Error fetching invitations:", error);
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-xl space-y-6 px-4 pb-48 pt-4">
        {failed ? (
          <p className="m-0 py-12 text-center text-body text-muted-foreground">{t("loadFailed")}</p>
        ) : !summary ? (
          <div className="flex justify-center py-12" aria-label={t("loading")}>
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : summary.canInvite ? (
          <InviteFriends summary={summary} />
        ) : (
          <Locked />
        )}
      </div>
      <FooterMenu />
    </div>
  );
}

/** Screen 1: no paid subscription yet. */
function Locked() {
  const t = useTranslations("invitations");

  return (
    <>
      <h1 className="m-0 text-[36px] font-extrabold leading-10 text-primary">{t("title")}</h1>
      <InviteIllustration />
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-md bg-primary-muted/70 p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Crown className="size-5" aria-hidden />
          </span>
          <span>
            <span className="block text-counter font-bold">{t("rewardMe", rewards)}</span>
            <span className="block text-body text-muted-foreground">{t("rewardMeCaption")}</span>
          </span>
        </div>
        <div className="flex items-center gap-3 rounded-md bg-success-bg p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
            <BadgePercent className="size-5" aria-hidden />
          </span>
          <span>
            <span className="block text-counter font-bold">{t("rewardFriend", rewards)}</span>
            <span className="block text-body text-muted-foreground">{t("rewardFriendCaption")}</span>
          </span>
        </div>
      </div>
      <p className="m-0 text-option text-muted-foreground">{t("lockedText", rewards)}</p>
      <BottomAction aboveFooter>
        <Button asChild variant="primary" size="block">
          <Link href="/settings/subscription">{t("chooseSubscription")}</Link>
        </Button>
      </BottomAction>
    </>
  );
}

/** Two people and an envelope; stands in for the 3D artwork until it is exported. */
function InviteIllustration() {
  return (
    <div className="relative mx-auto flex h-36 w-48 items-center justify-center" aria-hidden>
      <span className="absolute left-6 top-6 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-light to-primary shadow-lg">
        <UserRound className="size-12 text-primary-foreground" strokeWidth={2.5} />
      </span>
      <span className="absolute right-6 top-10 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-success/70 to-success shadow-lg">
        <UserRound className="size-9 text-success-foreground" strokeWidth={2.5} />
      </span>
      <span className="absolute bottom-3 left-1/2 flex size-11 -translate-x-1/3 items-center justify-center rounded-md bg-card shadow-md">
        <Mail className="size-6 text-primary" />
      </span>
    </div>
  );
}

/** Screen 2: paid subscriber — rewards card, invited friends, «Пригласить». */
function InviteFriends({ summary }: { summary: InvitationsSummary }) {
  const t = useTranslations("invitations");
  const [copied, setCopied] = useState(false);

  const invite = async () => {
    const link = summary.inviteLink;
    if (!link) return;
    try {
      shareURL(link, t("shareText"));
    } catch {
      // Outside Telegram (or an old client): copy the link instead.
      try {
        await navigator.clipboard.writeText(link);
        setCopied(true);
      } catch (error) {
        console.error("Could not share the invite link:", error);
      }
    }
  };

  return (
    <>
      <h1 className="m-0 text-[32px] font-bold leading-10">{t("title")}</h1>
      <section className="space-y-3 rounded-md border border-divider bg-card p-5">
        <span className="flex size-16 items-center justify-center rounded-md bg-primary-muted text-[32px]" aria-hidden>
          💌
        </span>
        <h2 className="m-0 text-[22px] font-bold leading-7">{t("cardTitle", rewards)}</h2>
        <p className="m-0 text-body text-muted-foreground">{t("cardText", rewards)}</p>
      </section>

      <section className="space-y-3">
        <h2 className="m-0 text-title">{t("invitedTitle")}</h2>
        {summary.invited.length === 0 ? (
          <p className="m-0 rounded-md border border-divider bg-card p-4 text-body text-muted-foreground">{t("invitedEmpty")}</p>
        ) : (
          <ul className="m-0 list-none divide-y divide-divider overflow-hidden rounded-md border border-divider bg-card p-0">
            {summary.invited.map((friend) => (
              <li key={friend.id}>
                <Link href={`/profile/${friend.id}`} className="flex items-center gap-3 px-4 py-3">
                  <Avatar name={friend.name} photo={friend.photo} className="size-12" />
                  <span className="min-w-0 truncate">
                    <span className="text-option font-semibold">{friend.name}</span>
                    {friend.occupation && <span className="ml-2 text-body text-muted-foreground">{friend.occupation}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <BottomAction aboveFooter>
        {copied && <p className="m-0 pb-2 text-center text-body text-success">{t("copied")}</p>}
        <Button variant="primary" size="block" disabled={!summary.inviteLink} onClick={invite}>
          {t("invite")}
        </Button>
      </BottomAction>
    </>
  );
}
