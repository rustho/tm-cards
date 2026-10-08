"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

/**
 * XP "Back" link: arrow + label, Option 17/24 in secondary text color,
 * gap 8, hugs its content (24px tall). Defaults to router.back() and the
 * `common.back` label.
 */
export interface BackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

const BackButton = React.forwardRef<HTMLButtonElement, BackButtonProps>(
  ({ className, children, onClick, type = "button", ...props }, ref) => {
    const router = useRouter();
    const t = useTranslations("common");

    return (
      <button
        ref={ref}
        type={type}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented && !onClick) router.back();
        }}
        className={cn(
          "inline-flex h-6 shrink-0 items-center gap-2 bg-transparent p-0 text-option text-muted-foreground transition-opacity",
          "hover:opacity-80 active:opacity-60 disabled:pointer-events-none disabled:opacity-50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xs",
          className
        )}
        {...props}
      >
        <svg
          aria-hidden
          viewBox="0 0 14 14"
          className="size-3 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 7H1M7 1 1 7l6 6" />
        </svg>
        {children ?? t("back")}
      </button>
    );
  }
);
BackButton.displayName = "BackButton";

export { BackButton };
