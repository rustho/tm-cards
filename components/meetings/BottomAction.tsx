"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getPendingFeedback } from "@/lib/pendingFeedback";

const AboveFooterContext = createContext<{ reminderHidden: boolean } | null>(null);

/**
 * Makes every BottomAction inside sit above the FooterMenu (for flows embedded in a tab page).
 * `reminderHidden` when that page renders `<FooterMenu hideReminder />`.
 */
export const BottomActionAboveFooter = ({ children, reminderHidden = false }: { children: ReactNode; reminderHidden?: boolean }) => (
  <AboveFooterContext.Provider value={{ reminderHidden }}>{children}</AboveFooterContext.Provider>
);

/**
 * Full-width action pinned to the bottom of the screen (pages using it add pb-28).
 * `aboveFooter` (or an enclosing BottomActionAboveFooter) lifts it over the floating FooterMenu
 * and its feedback reminder (pages then add pb-48).
 */
export const BottomAction = ({ children, aboveFooter }: { children: ReactNode; aboveFooter?: boolean }) => {
  const inherited = useContext(AboveFooterContext);
  const lifted = aboveFooter ?? Boolean(inherited);
  const watchReminder = lifted && !inherited?.reminderHidden;
  const [reminder, setReminder] = useState(false);

  useEffect(() => {
    if (!watchReminder) return;
    let cancelled = false;
    getPendingFeedback().then((pending) => !cancelled && setReminder(Boolean(pending)));
    return () => {
      cancelled = true;
    };
  }, [watchReminder]);

  // Tab bar ≈ 4.75rem; the reminder adds ≈ 4.5rem (card + gap).
  const offset = reminder ? "9.25rem" : "4.75rem";

  return (
    <div
      className="fixed inset-x-0 z-30 bg-gradient-to-t from-background via-background to-transparent px-4 pt-6"
      style={
        lifted
          ? { bottom: `calc(max(0.75rem, env(safe-area-inset-bottom)) + ${offset})`, paddingBottom: "0.5rem" }
          : { bottom: 0, paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }
      }
    >
      <div className="mx-auto max-w-xl">{children}</div>
    </div>
  );
};
