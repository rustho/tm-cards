"use client";

import { ReactNode } from "react";

interface StepContainerProps {
  title: string;
  children: ReactNode;
  onNext: () => void;
  nextDisabled?: boolean;
  nextText?: string;
}

export function StepContainer({
  title,
  children,
  onNext,
  nextDisabled = false,
  nextText = "Далее",
}: StepContainerProps) {
  return (
    <>
        <div className="step-container">
          <h2 className="card-text">{title}</h2>
          <div className="step-content">{children}</div>
        </div>
        <div className="button-container">
            <button
                className="next-button"
                size="l"
                mode="filled"
                stretched
                onClick={() => {
                    if (!nextDisabled) onNext();
                }}
                disabled={nextDisabled}
            >
                {nextText}
            </button>
        </div>
    </>
  );
} 