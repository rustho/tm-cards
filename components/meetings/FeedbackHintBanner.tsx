"use client";

import { useTranslations } from "next-intl";
import { MessageSquareHeart } from "lucide-react";

/** «Оставляй впечатление о встречах»: info banner, shown while a meeting waits for feedback. */
export const FeedbackHintBanner = () => {
  const t = useTranslations("meetings.hint");

  return (
    <aside className="flex gap-3 rounded-md border border-primary-light/50 bg-primary-muted/60 p-4">
      <MessageSquareHeart className="size-10 shrink-0 text-primary" strokeWidth={1.5} aria-hidden />
      <div className="space-y-2">
        <h2 className="m-0 text-counter font-semibold text-primary">{t("title")}</h2>
        <p className="m-0 text-body text-foreground">{t("learn")}</p>
        <p className="m-0 text-body text-foreground">{t("unlock")}</p>
      </div>
    </aside>
  );
};
