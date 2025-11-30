"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import "./Input.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="input-container">
        {label && <label className="input-label">{label}</label>}
        <input
          ref={ref}
          className={`input-field theme-input ${error ? "input-error" : ""} ${className || ""}`}
          {...props}
        />
        {helperText && !error && <span className="input-helper">{helperText}</span>}
        {error && <span className="input-error-text">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input"; 