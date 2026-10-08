"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

/**
 * XP title-bar button: 24×24, 4px radius, 1px *-dark border, vertical
 * gradient *-dark → *-glow, white glyph. `minimize` is blue (primary),
 * `close` is red (danger). aria-label defaults to `common.minimize` /
 * `common.close`.
 */
export type WindowControlVariant = "minimize" | "close";

export interface WindowControlProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: WindowControlVariant;
}

const variantClasses: Record<WindowControlVariant, string> = {
  minimize:
    "border-[hsl(var(--color-primary-dark))] bg-[linear-gradient(180deg,hsl(var(--color-primary-dark))_0%,hsl(var(--color-primary-glow))_100%)]",
  close:
    "border-[hsl(var(--color-danger-dark))] bg-[linear-gradient(180deg,hsl(var(--color-danger-dark))_0%,hsl(var(--color-danger-glow))_100%)]",
};

const glyphs: Record<WindowControlVariant, React.ReactNode> = {
  minimize: <rect x="3" y="6.25" width="8" height="1.5" fill="currentColor" stroke="none" />,
  close: <path d="M3 3l8 8M11 3l-8 8" />,
};

const WindowControl = React.forwardRef<HTMLButtonElement, WindowControlProps>(
  ({ className, variant, type = "button", "aria-label": ariaLabel, ...props }, ref) => {
    const t = useTranslations("common");

    return (
      <button
        ref={ref}
        type={type}
        aria-label={ariaLabel ?? t(variant)}
        className={cn(
          "inline-flex size-6 shrink-0 items-center justify-center rounded-sm border p-0 text-white transition-[filter]",
          "hover:brightness-110 active:brightness-90 disabled:pointer-events-none disabled:opacity-50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <svg
          aria-hidden
          viewBox="0 0 14 14"
          className="size-3.5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="square"
        >
          {glyphs[variant]}
        </svg>
      </button>
    );
  }
);
WindowControl.displayName = "WindowControl";

export { WindowControl };
