import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * XP age summary: centered age ("31 год") in Option 17/24 primary text,
 * hint below ("Возраст не отображается в анкете") in Caption 13/18
 * secondary text, 8px gap. Full width, hugs its content (50px tall).
 * Pass already-formatted strings; pluralize the age via next-intl.
 */
export interface AgeSummaryProps extends React.HTMLAttributes<HTMLDivElement> {
  age: React.ReactNode;
  hint?: React.ReactNode;
}

const AgeSummary = React.forwardRef<HTMLDivElement, AgeSummaryProps>(
  ({ className, age, hint, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex w-full flex-col items-center gap-2 text-center", className)}
      {...props}
    >
      <span className="text-option text-foreground">{age}</span>
      {hint && <span className="text-caption text-muted-foreground">{hint}</span>}
    </div>
  )
);
AgeSummary.displayName = "AgeSummary";

export { AgeSummary };
