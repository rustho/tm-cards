import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * XP step item: 12×12 square, 2px radius — one cell of the wizard progress.
 * Active (passed or current step) — solid primary fill;
 * inactive — surface with a 1px primary border.
 */
export interface StepItemProps extends React.HTMLAttributes<HTMLSpanElement> {
  active?: boolean;
}

const StepItem = React.forwardRef<HTMLSpanElement, StepItemProps>(
  ({ className, active = false, ...props }, ref) => (
    <span
      ref={ref}
      data-state={active ? "active" : "inactive"}
      className={cn(
        "block h-3 w-3 shrink-0 rounded-[2px] border border-primary transition-colors",
        active ? "bg-primary" : "bg-surface",
        className
      )}
      {...props}
    />
  )
);
StepItem.displayName = "StepItem";

export { StepItem };
