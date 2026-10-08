import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * XP counter badge: "1/11" in Counter 16/22, secondary text color,
 * padding 6×10, 4px radius on surface. Hugs its content (34px tall).
 */
export interface CounterBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  current: number;
  total: number;
}

const CounterBadge = React.forwardRef<HTMLSpanElement, CounterBadgeProps>(
  ({ className, current, total, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex h-[34px] shrink-0 items-center justify-center whitespace-nowrap rounded-sm bg-surface px-2.5 py-1.5 text-counter tabular-nums text-muted-foreground",
        className
      )}
      {...props}
    >
      {current}/{total}
    </span>
  )
);
CounterBadge.displayName = "CounterBadge";

export { CounterBadge };
