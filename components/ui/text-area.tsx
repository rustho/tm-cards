"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * XP text area. Surface box with a 1px divider stroke (primary on focus),
 * radius 8, padding 12×16; the textarea is at least 80px tall and
 * auto-grows with content. With `maxLength` (or `showCounter`) a
 * right-aligned "n/max" counter (Caption 13/18, text-secondary) sits in the
 * bottom-right corner. Works controlled, uncontrolled and with RHF `register`.
 */
export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  showCounter?: boolean;
  error?: boolean;
  containerClassName?: string;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    { className, containerClassName, maxLength, showCounter, error = false, onChange, value, defaultValue, ...props },
    ref
  ) => {
    const innerRef = React.useRef<HTMLTextAreaElement | null>(null);
    const [length, setLength] = React.useState(() => String(value ?? defaultValue ?? "").length);

    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    // Sync with controlled values and values set by RHF (reset/setValue).
    React.useEffect(() => {
      if (innerRef.current) setLength(innerRef.current.value.length);
    });

    const withCounter = showCounter ?? maxLength !== undefined;

    return (
      <div
        className={cn(
          "flex min-w-[120px] flex-col gap-2 rounded-md border bg-surface px-4 py-3 transition-colors",
          "focus-within:border-primary",
          error ? "border-destructive focus-within:border-destructive" : "border-divider",
          props.disabled && "opacity-50",
          containerClassName
        )}
      >
        <textarea
          ref={setRefs}
          value={value}
          defaultValue={defaultValue}
          maxLength={maxLength}
          aria-invalid={error || undefined}
          onChange={(e) => {
            setLength(e.target.value.length);
            onChange?.(e);
          }}
          className={cn(
            "min-h-20 w-full flex-1 resize-none bg-transparent text-option text-foreground outline-none",
            "placeholder:text-muted-foreground disabled:cursor-not-allowed",
            "[field-sizing:content]",
            className
          )}
          {...props}
        />
        {withCounter && (
          <span className="self-end text-right text-caption text-muted-foreground tabular-nums" aria-live="polite">
            {length}
            {maxLength !== undefined && `/${maxLength}`}
          </span>
        )}
      </div>
    );
  }
);
TextArea.displayName = "TextArea";

export { TextArea };
