"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { MessageSquareHeart, X } from "lucide-react";

const DISMISSED_KEY = "tm.feedbackHintDismissed";

/** «Оставляй впечатление о встречах»: info banner the user can close for good (per device). */
export const FeedbackHintBanner = () => {
  const t = useTranslations("meetings.hint");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(DISMISSED_KEY) !== "1");
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // storage unavailable: hide for this visit only
    }
  };

  return (
    <aside className="relative flex gap-3 rounded-md border border-primary-light/50 bg-primary-muted/60 p-4 pr-10">
      <MessageSquareHeart className="size-10 shrink-0 text-primary" strokeWidth={1.5} aria-hidden />
      <div className="space-y-2">
        <h2 className="m-0 text-counter font-semibold text-primary">{t("title")}</h2>
        <p className="m-0 text-body text-foreground">{t("learn")}</p>
        <p className="m-0 text-body text-foreground">{t("unlock")}</p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("close")}
        className="absolute right-2 top-2 rounded-xs p-1 text-muted-foreground hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </aside>
  );
};
