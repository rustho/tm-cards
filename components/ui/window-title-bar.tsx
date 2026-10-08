"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * XP window title bar: 40px tall, 8px top radius, #296CF9 fill with a 1px
 * primary-dark border, white highlight on top and dark shade at the bottom
 * (inset shadows). Title (Option 17/24 bold) on the left, optional `actions` (e.g.
 * `WindowControl`s) on the right. Sits on top of a window body.
 */
export interface WindowTitleBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  actions?: React.ReactNode;
}

const WindowTitleBar = React.forwardRef<HTMLDivElement, WindowTitleBarProps>(
  ({ className, title, actions, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between gap-2 rounded-t-md border border-[hsl(var(--color-primary-dark))] bg-[hsl(var(--color-titlebar))] pl-3 pr-2 text-white",
        "shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.45),inset_0_-2px_4px_0_rgba(0,0,0,0.25)]",
        className
      )}
      {...props}
    >
      <h2 className="m-0 min-w-0 truncate text-option font-bold text-inherit">{title}</h2>
      {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
    </div>
  )
);
WindowTitleBar.displayName = "WindowTitleBar";

export { WindowTitleBar };
