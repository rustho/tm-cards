import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * XP single-line input, the one-line sibling of `TextArea`: surface fill,
 * 1px divider stroke (primary on focus, danger with `error`), radius 8,
 * 56px tall, padding 0×16, Option 17/24 text. Works with RHF `register`.
 */
export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, error = false, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      aria-invalid={error || undefined}
      className={cn(
        "flex h-14 w-full rounded-md border bg-surface px-4 text-option text-foreground transition-colors",
        "placeholder:text-muted-foreground focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error ? "border-destructive" : "border-divider focus:border-primary",
        className
      )}
      {...props}
    />
  )
);
TextInput.displayName = "TextInput";

export { TextInput };
