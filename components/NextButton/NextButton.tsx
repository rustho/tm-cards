"use client";

import { ButtonHTMLAttributes } from "react";
import "./NextButton.css";

interface NextButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function NextButton({ children, className, ...props }: NextButtonProps) {
  return (
    <div className="button-container">
      <button className={`next-button ${className || ""}`} {...props}>
        {children}
      </button>
    </div>
  );
}

