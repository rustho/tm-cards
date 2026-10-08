"use client";

import { useTranslations } from "next-intl";
import { Clock } from "lucide-react";
import { splitDuration, useCountdown } from "@/hooks/useCountdown";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

/** «23:59:42» pill; days, when any, go in front («2д 06:00:00»). `icon` adds the green clock (waiting state). */
export const CountdownPill = ({ deadline, icon = false }: { deadline: string; icon?: boolean }) => {
  const t = useTranslations("weekMatch");
  const { days, hours, minutes, seconds } = splitDuration(useCountdown(deadline));
  return (
    <span className="inline-flex items-center gap-3 rounded-full bg-primary-muted/60 px-6 py-2">
      {icon && <Clock className="size-5 text-success" aria-hidden />}
      <span className={cn("font-bold tabular-nums text-foreground", icon ? "text-option" : "text-[34px] leading-10")}>
        {days > 0 && `${t("daysShort", { days })} `}
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </span>
    </span>
  );
};

/** «2 : 06 : 02» with «дня / часов / минуты» captions. */
export const CountdownBoxes = ({ deadline }: { deadline: string }) => {
  const t = useTranslations("weekMatch");
  const { days, hours, minutes } = splitDuration(useCountdown(deadline));
  const parts = [
    { value: String(days), label: t("days", { count: days }) },
    { value: pad(hours), label: t("hours", { count: hours }) },
    { value: pad(minutes), label: t("minutes", { count: minutes }) },
  ];
  return (
    <div className="flex items-start justify-center gap-4 rounded-xl bg-primary-muted/50 px-4 py-5">
      {parts.map((part, i) => (
        <div key={part.label + i} className="flex items-start gap-4">
          {i > 0 && <span className="pt-2 text-[28px] font-bold text-primary">:</span>}
          <div className="flex w-16 flex-col items-center">
            <span className="text-[40px] font-bold leading-[48px] tabular-nums text-foreground">{part.value}</span>
            <span className="text-body text-muted-foreground">{part.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
