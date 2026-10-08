import * as React from "react";

import { cn } from "@/lib/utils";

import { StatusIcon } from "./status-icon";

/**
 * XP unlock divider: padlock + label + 1px rule filling the rest of the row,
 * all in primary (#0054E3). 32px tall, 4px left padding, 12px gaps, Body 15/20.
 * Separates available items from ones that unlock later ("Появятся осенью").
 */
export interface UnlockDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
}

const UnlockDivider = React.forwardRef<HTMLDivElement, UnlockDividerProps>(
  ({ className, label, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex h-8 w-full items-center gap-3 pl-1 text-primary", className)}
      {...props}
    >
      <StatusIcon status="locked" className="text-primary" />
      <span className="shrink-0 whitespace-nowrap text-body">{label}</span>
      <span aria-hidden className="h-px flex-1 bg-current" />
    </div>
  )
);
UnlockDivider.displayName = "UnlockDivider";

export { UnlockDivider };
