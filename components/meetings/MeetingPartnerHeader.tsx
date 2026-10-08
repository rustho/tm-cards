import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronRight, MapPin } from "lucide-react";
import type { MeetingDetails } from "@/models/types";
import { Avatar } from "@/components/ui/avatar";

/** Big photo, name, occupation, «Город, Страна» and «Открыть анкету» above every feedback step. */
export const MeetingPartnerHeader = ({ partner }: { partner: MeetingDetails["partner"] }) => {
  const t = useTranslations("weekMatch");
  return (
    <header className="space-y-5 border-b border-divider pb-5">
      <div className="flex items-center gap-5">
        <Avatar name={partner.name} photo={partner.photo} className="size-28 text-3xl" />
        <div className="min-w-0 space-y-1">
          <h1 className="m-0 truncate text-[24px] font-bold leading-8">{partner.name}</h1>
          {partner.occupation && <p className="m-0 text-body text-muted-foreground">{partner.occupation}</p>}
          {partner.location && (
            <p className="m-0 flex items-center gap-1.5 text-body text-foreground">
              <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
              {partner.location}
            </p>
          )}
        </div>
      </div>
      <Link
        href={`/profile/${partner.id}`}
        className="flex items-center rounded-md bg-primary-muted/70 px-4 py-3.5 text-option text-primary"
      >
        <span className="flex-1 text-center">{t("openProfile")}</span>
        <ChevronRight className="size-5" aria-hidden />
      </Link>
    </header>
  );
};
