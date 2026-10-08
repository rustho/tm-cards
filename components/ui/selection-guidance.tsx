import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * XP selection guidance: hint above a selection grid ("Выбери от 3 до 10")
 * in Body 15/20 secondary text, left-aligned, full width (20px tall).
 * Pass an already-translated string as children.
 */
export type SelectionGuidanceProps = React.HTMLAttributes<HTMLParagraphElement>;

const SelectionGuidance = React.forwardRef<HTMLParagraphElement, SelectionGuidanceProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("m-0 w-full text-body text-muted-foreground", className)}
      {...props}
    />
  )
);
SelectionGuidance.displayName = "SelectionGuidance";

export { SelectionGuidance };
