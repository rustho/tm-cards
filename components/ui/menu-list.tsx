import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * XP settings list of `MenuRow`s.
 * `grouped`  — one bordered card (12px radius, divider lines), emoji on light-blue tiles,
 *              the «Профиль» menu;
 * `separate` — every row its own card (12px radius, 12px apart) with a primary chevron,
 *              the questionnaire field list.
 */
export interface MenuListProps extends React.HTMLAttributes<HTMLUListElement> {
  variant?: "grouped" | "separate";
}

const MenuList = ({ className, variant = "grouped", ...props }: MenuListProps) => (
  <ul
    className={cn(
      "m-0 list-none p-0",
      variant === "grouped"
        ? "divide-y divide-divider overflow-hidden rounded-[12px] border border-divider bg-card [&_[data-icon]]:size-10 [&_[data-icon]]:rounded-md [&_[data-icon]]:bg-primary-light/40 [&_[data-icon]]:text-[22px]"
        : "space-y-3 [&>li]:overflow-hidden [&>li]:rounded-[12px] [&>li]:border [&>li]:border-divider [&>li]:bg-card [&_[data-chevron]]:text-primary",
      className
    )}
    {...props}
  />
);

/**
 * One row: emoji, label (with an optional muted `description` line under it, truncated),
 * optional short `value` on the right, then a chevron.
 * `href` makes it a link, `onClick` a button; with `trailing` (e.g. a Switch) the row is a
 * plain container without a chevron, so the control handles the interaction.
 */
export interface MenuRowProps {
  icon: React.ReactNode;
  label: React.ReactNode;
  description?: React.ReactNode;
  value?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  trailing?: React.ReactNode;
  className?: string;
}

const MenuRow = ({ icon, label, description, value, href, onClick, trailing, className }: MenuRowProps) => {
  const content = (
    <>
      <span data-icon className="flex size-7 shrink-0 items-center justify-center text-[24px] leading-none" aria-hidden>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-option">{label}</span>
        {description && <span className="block truncate text-body text-muted-foreground">{description}</span>}
      </span>
      {value != null && value !== "" && (
        <span className="max-w-[45%] shrink-0 truncate text-body text-muted-foreground">{value}</span>
      )}
      {trailing ?? <ChevronRight data-chevron className="size-5 shrink-0 text-muted-foreground" aria-hidden />}
    </>
  );
  const rowClass = cn(
    "flex min-h-14 w-full items-center gap-3 px-4 py-2 text-left text-foreground",
    !trailing && "transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none",
    className
  );

  return (
    <li>
      {trailing ? (
        <div className={rowClass}>{content}</div>
      ) : href ? (
        <Link href={href} className={rowClass}>
          {content}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className={rowClass}>
          {content}
        </button>
      )}
    </li>
  );
};

export { MenuList, MenuRow };
