"use client";

import { ReactNode } from "react";
import { NextButton } from "../NextButton";
import "./StepContainer.css";

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
    <div className="step-container-wrapper">
      <div className="step-container">
        <h2 className="card-text">{title}</h2>
        <div className="step-content">{children}</div>
      </div>
      <NextButton
        onClick={() => {
          if (!nextDisabled) onNext();
        }}
        disabled={nextDisabled}
      >
        {nextText}
      </NextButton>
    </div>
  );
}
