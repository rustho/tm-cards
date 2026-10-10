"use client";

import { createContext, useContext, type ReactNode } from "react";

const AboveFooterContext = createContext(false);

/** Makes every BottomAction inside sit above the FooterMenu (for flows embedded in a tab page). */
export const BottomActionAboveFooter = ({ children }: { children: ReactNode }) => (
  <AboveFooterContext.Provider value>{children}</AboveFooterContext.Provider>
);

/**
 * Full-width action pinned to the bottom of the screen (pages using it add pb-28).
 * `aboveFooter` (or an enclosing BottomActionAboveFooter) lifts it over the floating FooterMenu
 * (pages then add pb-48). Pages with it don't show the FooterMenu feedback reminder.
 */
export const BottomAction = ({ children, aboveFooter }: { children: ReactNode; aboveFooter?: boolean }) => {
  const inherited = useContext(AboveFooterContext);
  const lifted = aboveFooter ?? inherited;

  return (
    <div
      className="fixed inset-x-0 z-30 bg-gradient-to-t from-background via-background to-transparent px-4 pt-6"
      style={
        lifted
          ? { bottom: "calc(max(0.75rem, env(safe-area-inset-bottom)) + 4.75rem)", paddingBottom: "0.5rem" }
          : { bottom: 0, paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }
      }
    >
      <div className="mx-auto max-w-xl">{children}</div>
    </div>
  );
};
