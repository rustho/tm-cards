"use client";

import { useTranslations } from "next-intl";
import { splitDuration, useCountdown } from "@/hooks/useCountdown";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * «2 : 06 : 02» with «дня / часов / минуты» captions.
 * `plain`: no tinted box, blue digits (inside a card on the «Встречи» tab).
 */
export const CountdownBoxes = ({ deadline, plain = false }: { deadline: string; plain?: boolean }) => {
  const t = useTranslations("weekMatch");
  const { days, hours, minutes } = splitDuration(useCountdown(deadline));
  const parts = [
    { value: String(days), label: t("days", { count: days }) },
    { value: pad(hours), label: t("hours", { count: hours }) },
    { value: pad(minutes), label: t("minutes", { count: minutes }) },
  ];
  return (
    <div className={cn("flex items-start justify-center gap-4", !plain && "rounded-xl bg-primary-muted/50 px-4 py-5")}>
      {parts.map((part, i) => (
        <div key={part.label + i} className="flex items-start gap-4">
          {i > 0 && <span className={cn("pt-2 text-[28px] font-bold", plain ? "text-foreground" : "text-primary")}>:</span>}
          <div className="flex w-16 flex-col items-center">
            <span className={cn("text-[40px] font-bold leading-[48px] tabular-nums", plain ? "text-primary" : "text-foreground")}>{part.value}</span>
            <span className="text-body text-muted-foreground">{part.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
