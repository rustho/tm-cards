"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Meeting } from "@/models/types";
import { Avatar } from "@/components/ui/avatar";
import { MeetingStatusLabel } from "./MeetingStatusLabel";

/** XP section: blue title bar over divided meeting rows. */
export const MeetingList = ({ title, meetings }: { title: string; meetings: Meeting[] }) => {
  const t = useTranslations("meetings");

  return (
    <section className="overflow-hidden rounded-md border border-divider bg-card">
      <h2 className="m-0 border-b border-divider px-4 py-3 text-title text-primary">{title}</h2>
      {meetings.length === 0 ? (
        <p className="m-0 px-4 py-6 text-body text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="m-0 list-none divide-y divide-divider p-0">
          {meetings.map((meeting) => (
            <li key={meeting.matchId} className="flex items-center gap-3 px-4 py-3">
              <Link href={`/profile/${meeting.partner.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar name={meeting.partner.name} photo={meeting.partner.photo} className="size-14 text-lg" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-option font-semibold text-foreground">{meeting.partner.name}</span>
                  <MeetingStatusLabel status={meeting.status} className="text-chip" />
                </span>
              </Link>
              {meeting.action && (
                <Link
                  href={`/home/meetings/${meeting.matchId}`}
                  className="max-w-[8.5rem] shrink-0 rounded-md border border-primary bg-card px-2 py-1.5 text-center text-caption text-primary transition-colors hover:bg-primary-muted"
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
