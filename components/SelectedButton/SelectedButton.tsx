"use client";

import { ButtonHTMLAttributes } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import "./SelectedButton.css";

interface SelectedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

/** Toggle chip used by multi-select wizard steps. */
export function SelectedButton({ selected, disabled, children, className, ...props }: SelectedButtonProps) {
  return (
    <Button
      type="button"
      size="sm"
      variant={selected ? "default" : "outline"}
      disabled={disabled}
      aria-pressed={selected}
      className={cn("selected-button h-auto whitespace-normal py-2", selected && "selected", className)}
      {...props}
    >
      {children}
    </Button>
  );
}
