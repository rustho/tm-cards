"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Meeting } from "@/models/types";
import { Avatar } from "@/components/ui/avatar";
import { MeetingStatusLabel } from "./MeetingStatusLabel";

/** Card with a light-blue outline: bold blue title, then divided meeting rows with an outlined action. */
export const MeetingList = ({ title, meetings }: { title: string; meetings: Meeting[] }) => {
  const t = useTranslations("meetings");

  return (
    <section className="overflow-hidden rounded-[12px] border border-primary-light/50 bg-card">
      <h2 className="m-0 px-4 pb-1 pt-4 text-[22px] font-bold leading-7 text-primary">{title}</h2>
      {meetings.length === 0 ? (
        <p className="m-0 px-4 pb-5 pt-2 text-body text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="m-0 list-none divide-y divide-divider px-2.5 pb-1 pt-0">
          {meetings.map((meeting) => (
            <li key={meeting.matchId} className="flex items-center gap-2.5 py-3">
              <Link href={`/profile/${meeting.partner.id}`} className="flex min-w-0 flex-1 items-center gap-2.5">
                <Avatar name={meeting.partner.name} photo={meeting.partner.photo} className="size-11 text-lg" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-counter font-semibold text-foreground">{meeting.partner.name}</span>
                  <MeetingStatusLabel status={meeting.status} />
                </span>
              </Link>
              {meeting.action && (
                <Link
                  href={`/home/meetings/${meeting.matchId}`}
                  className="flex min-h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-[12px] border border-primary bg-card px-1 py-1.5 text-center text-[12px] leading-4 text-primary transition-colors hover:bg-primary-muted"
                >
                  {t(meeting.action === "share" ? "share" : "view")}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
