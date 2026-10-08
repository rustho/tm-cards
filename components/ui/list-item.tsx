import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * XP list item: emoji + label, optional description and note below.
 * Min 44px tall (grows with content), 8px radius, padding 6×12, gap 8.
 * `default`  — surface, 1px divider border;
 * `selected` — primary-muted fill, 1px primary border.
 */
export interface ListItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  label: React.ReactNode;
  icon?: React.ReactNode;
  description?: React.ReactNode;
  note?: React.ReactNode;
  selected?: boolean;
}

const ListItem = React.forwardRef<HTMLButtonElement, ListItemProps>(
  (
    { className, label, icon, description, note, selected = false, type = "button", ...props },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      data-state={selected ? "selected" : "default"}
      aria-pressed={selected}
      className={cn(
        "flex min-h-11 w-full items-center gap-2 rounded-md border px-3 py-1.5 text-left text-foreground transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        selected ? "border-primary bg-primary-muted" : "border-divider bg-surface",
        className
      )}
      {...props}
    >
      {icon && (
        <span className="flex size-6 shrink-0 items-center justify-center text-[20px] leading-none" aria-hidden>
          {icon}
        </span>
      )}
      <span className="flex min-w-0 flex-col">
        <span className="text-option">{label}</span>
        {description && <span className="text-body text-muted-foreground">{description}</span>}
        {note && <span className="text-chip font-bold text-muted-foreground">{note}</span>}
      </span>
    </button>
  )
);
ListItem.displayName = "ListItem";

export { ListItem };
