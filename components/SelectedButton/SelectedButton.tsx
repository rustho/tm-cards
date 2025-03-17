"use client";

import { Button } from "@telegram-apps/telegram-ui";
import { ButtonHTMLAttributes } from "react";

interface SelectedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

export function SelectedButton({ 
  selected, 
  disabled, 
  children, 
  className,
  ...props 
}: SelectedButtonProps) {
  return (
    <Button
      size="m"
      mode={selected ? "filled" : "outline"}
      disabled={disabled}
      className={`selected-button ${selected ? "selected" : ""} ${className || ""}`}
      {...props}
    >
      {children}
    </Button>
  );
} 