import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * XP meeting goal card: emoji top-left, bold title + description,
 * optional muted hint below (visibility condition). 8px radius,
 * padding 16×12, 12px gap between emoji and text.
 * `default`  — surface, 1px divider border;
 * `selected` — primary-muted fill, 1px primary border.
 */
export interface MeetingGoalCardProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  emoji?: React.ReactNode;
  hint?: React.ReactNode;
  showHint?: boolean;
  selected?: boolean;
}

const MeetingGoalCard = React.forwardRef<HTMLButtonElement, MeetingGoalCardProps>(
  (
    {
      className,
      title,
      description,
      emoji,
      hint,
      showHint = false,
      selected = false,
      type = "button",
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      data-state={selected ? "selected" : "default"}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-start gap-3 rounded-md border px-4 py-3 text-left text-foreground transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        selected ? "border-primary bg-primary-muted" : "border-divider bg-surface",
        className
      )}
      {...props}
    >
      {emoji && (
        <span className="flex size-6 shrink-0 items-center justify-center text-[20px] leading-none" aria-hidden>
          {emoji}
        </span>
      )}
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-counter font-bold">{title}</span>
        {description && <span className="text-body">{description}</span>}
        {showHint && hint && <span className="text-chip text-muted-foreground">{hint}</span>}
      </span>
    </button>
  )
);
MeetingGoalCard.displayName = "MeetingGoalCard";

export { MeetingGoalCard };
