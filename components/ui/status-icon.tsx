import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * XP status icon: 24×24 glyph, 2px rounded stroke in currentColor.
 * `locked` — padlock in icon-disabled grey (#BEC2C9). Decorative by default;
 * pass `aria-label` to expose it to screen readers.
 */
export type StatusIconStatus = "locked";

export interface StatusIconProps extends React.SVGAttributes<SVGSVGElement> {
  status?: StatusIconStatus;
}

const statusClasses: Record<StatusIconStatus, string> = {
  locked: "text-icon-disabled",
};

const glyphs: Record<StatusIconStatus, React.ReactNode> = {
  locked: (
    <>
      <rect x="4.5" y="10" width="15" height="11.5" rx="3" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path d="M12 14v3.5" />
    </>
  ),
};

const StatusIcon = React.forwardRef<SVGSVGElement, StatusIconProps>(
  ({ className, status = "locked", "aria-label": ariaLabel, ...props }, ref) => (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      data-status={status}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      className={cn("size-6 shrink-0", statusClasses[status], className)}
      {...props}
    >
      {glyphs[status]}
    </svg>
  )
);
StatusIcon.displayName = "StatusIcon";

export { StatusIcon };
