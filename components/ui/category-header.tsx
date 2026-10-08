import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * XP category header: 28×28 icon tile (primary-muted, 6px radius) + title
 * in Inter 16/24 bold, text-foreground, 10px gap. Hugs its content (28px tall).
 * The default glyph is the primary-colored diamond; pass `icon` to override,
 * or `icon={false}` for a bare title.
 */
export interface CategoryHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  icon?: React.ReactNode | false;
}

const DiamondGlyph = () => (
  <svg viewBox="0 0 12 12" aria-hidden className="size-3 text-primary">
    <rect x="2" y="2" width="8" height="8" rx="1" transform="rotate(45 6 6)" fill="currentColor" />
  </svg>
);

const CategoryHeader = React.forwardRef<HTMLDivElement, CategoryHeaderProps>(
  ({ className, title, icon, ...props }, ref) => (
    <div ref={ref} className={cn("inline-flex h-7 items-center gap-2.5", className)} {...props}>
      {icon !== false && (
        <span
          aria-hidden
          className="flex size-7 shrink-0 items-center justify-center rounded-[6px] bg-primary-muted"
        >
          {icon ?? <DiamondGlyph />}
        </span>
      )}
      <h3 className="m-0 min-w-0 truncate text-[16px] font-bold leading-6 text-foreground">{title}</h3>
    </div>
  )
);
CategoryHeader.displayName = "CategoryHeader";

export { CategoryHeader };
