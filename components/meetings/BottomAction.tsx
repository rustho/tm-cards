import type { ReactNode } from "react";

/**
 * Full-width action pinned to the bottom of the screen (pages using it add pb-28).
 * `aboveFooter` lifts it over the floating FooterMenu (pages then add pb-48).
 */
export const BottomAction = ({ children, aboveFooter = false }: { children: ReactNode; aboveFooter?: boolean }) => (
  <div
    className="fixed inset-x-0 z-30 bg-gradient-to-t from-background via-background to-transparent px-4 pt-6"
    style={
      aboveFooter
        ? { bottom: "calc(max(0.75rem, env(safe-area-inset-bottom)) + 4.75rem)", paddingBottom: "0.5rem" }
        : { bottom: 0, paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }
    }
  >
    <div className="mx-auto max-w-xl">{children}</div>
  </div>
);
