import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * XP interest chip: emoji + label, Chip 14/20, 32px tall, 26px radius,
 * padding 6×11, gap 4. Hugs its content.
 * `default`  — surface, 1px divider border;
 * `selected` — primary-muted fill, 1px primary border.
 */
export interface InterestChipProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  label: React.ReactNode;
  icon?: React.ReactNode;
  selected?: boolean;
}

const InterestChip = React.forwardRef<HTMLButtonElement, InterestChipProps>(
  ({ className, label, icon, selected = false, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      data-state={selected ? "selected" : "default"}
      aria-pressed={selected}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-xl border px-2.75 py-1.5 text-chip text-foreground transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        selected ? "border-primary bg-primary-muted" : "border-divider bg-surface",
        className
      )}
      {...props}
    >
      {icon && (
        <span className="inline-flex w-4 shrink-0 justify-center leading-none" aria-hidden>
          {icon}
        </span>
      )}
      <span>{label}</span>
    </button>
  )
);
InterestChip.displayName = "InterestChip";

export { InterestChip };
