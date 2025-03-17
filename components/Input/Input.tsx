"use client";

import { Input as TelegramInput } from "@telegram-apps/telegram-ui";
import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className, ...props }: InputProps) {
  return (
    <div className="input-container">
      {label && <label className="input-label">{label}</label>}
      <TelegramInput
        className={`input-field ${error ? "input-error" : ""} ${className || ""}`}
        {...props}
      />
      {helperText && !error && <span className="input-helper">{helperText}</span>}
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
} 