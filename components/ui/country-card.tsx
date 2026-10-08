import * as React from "react";

import { cn } from "@/lib/utils";
import { StatusIcon } from "./status-icon";

/**
 * XP country card: 66px row, 4px radius, 16px side padding.
 * 34×34 icon, 20px gap, label in text-option (17/24).
 * `default`  — surface, 1px divider border;
 * `selected` — primary-muted fill, 1px primary border;
 * `locked`   — background fill, disabled label, bottom primary-muted rule,
 *              padlock on the right; not clickable.
 */
export type CountryCardState = "default" | "selected" | "locked";

export interface CountryCardProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  label: React.ReactNode;
  icon?: React.ReactNode;
  state?: CountryCardState;
}

const stateClasses: Record<CountryCardState, string> = {
  default: "rounded-sm border border-divider bg-surface text-foreground",
  selected: "rounded-sm border border-primary bg-primary-muted text-foreground",
  locked:
    "rounded-none border-0 border-b border-primary-muted bg-background text-text-disabled cursor-not-allowed",
};

const CountryCard = React.forwardRef<HTMLButtonElement, CountryCardProps>(
  ({ className, label, icon, state = "default", disabled, type = "button", ...props }, ref) => {
    const locked = state === "locked";

    return (
      <button
        ref={ref}
        type={type}
        data-state={state}
        aria-pressed={locked ? undefined : state === "selected"}
        aria-disabled={locked || disabled || undefined}
        disabled={locked || disabled}
        className={cn(
          "flex h-[66px] w-full items-center justify-between gap-5 px-4 text-left transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          stateClasses[state],
          className
        )}
        {...props}
      >
        <span className="flex min-w-0 items-center gap-5">
          {icon && (
            <span className="flex size-[34px] shrink-0 items-center justify-center [&>img]:size-full [&>svg]:size-full">
              {icon}
            </span>
          )}
          <span className="truncate text-option">{label}</span>
        </span>
        {locked && <StatusIcon status="locked" />}
      </button>
    );
  }
);
CountryCard.displayName = "CountryCard";

export { CountryCard };
