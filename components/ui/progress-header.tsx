"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { BackButton } from "./back-button";
import { CounterBadge } from "./counter-badge";
import { StepItem } from "./step-item";

/**
 * XP progress header: Back link on the left, a row of step items in the
 * middle (passed and current steps filled), "current/total" counter on the
 * right. `current` is 1-based. Step gaps shrink from 6px to 2px on narrow
 * screens so 11 steps still fit at 375px.
 */
export interface ProgressHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  current: number;
  total: number;
  onBack?: () => void;
  backLabel?: React.ReactNode;
}

const ProgressHeader = React.forwardRef<HTMLDivElement, ProgressHeaderProps>(
  ({ className, current, total, onBack, backLabel, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex w-full items-center justify-between gap-3", className)}
      {...props}
    >
      <BackButton onClick={onBack}>{backLabel}</BackButton>
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        className="mx-auto flex min-w-0 max-w-[192px] flex-1 items-center justify-between gap-0.5"
      >
        {Array.from({ length: total }, (_, i) => (
          <StepItem key={i} active={i < current} />
        ))}
      </div>
      <CounterBadge current={current} total={total} className="bg-transparent px-0" />
    </div>
  )
);
ProgressHeader.displayName = "ProgressHeader";

export { ProgressHeader };
