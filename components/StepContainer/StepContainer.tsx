"use client";

import { Button } from "@telegram-apps/telegram-ui";
import { ReactNode } from "react";

interface StepContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextText?: string;
  backText?: string;
}

export function StepContainer({
  title,
  description,
  children,
  onBack,
  onNext,
  nextDisabled = false,
  nextText = "Далее",
  backText = "Назад"
}: StepContainerProps) {
  return (
    <div className="step-container">
      <h2 className="card-text">{title}</h2>
      {description && <p className="step-description">{description}</p>}
      <form onSubmit={(e) => {
        e.preventDefault();
        if (!nextDisabled) onNext();
      }}>
        {children}
        <div className="button-container">
          <Button
            size="l"
            mode="outline"
            stretched
            onClick={onBack}
          >
            {backText}
          </Button>
          <Button
            size="l"
            mode="filled"
            stretched
            onClick={onNext}
            disabled={nextDisabled}
          >
            {nextText}
          </Button>
        </div>
      </form>
    </div>
  );
} 