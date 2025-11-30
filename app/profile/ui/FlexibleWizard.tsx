"use client";

import { ReactNode, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import "./FlexibleWizard.css";
import { Profile } from "@/models/types";
import { WizardProvider, useWizardContext } from "./WizardContext";

export interface WizardStepConfig {
  id: string;
  component: React.ComponentType<any>;
  title?: string;
  props?: Record<string, any>;
}

export interface FlexibleWizardProps {
  steps: WizardStepConfig[];
  mode?: "full" | "edit";
  initialStepIndex?: number; // 0-based index
  initialData: Partial<Profile>;
  onComplete?: (data: Profile) => void;
  onStepComplete?: (stepId: string, data: Partial<Profile>) => void;
  onCancel?: () => void;
}

function FlexibleWizardInner({
  steps,
  mode = "full",
  onComplete,
  onStepComplete,
  onCancel,
}: Omit<FlexibleWizardProps, "initialData" | "initialStepIndex">) {
  const t = useTranslations("profile.wizard");
  const { getValues, currentStepIndex, goToNextStep, goToPreviousStep } =
    useWizardContext();

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = async () => {
    const currentData = getValues();

    if (onStepComplete && currentStep) {
      onStepComplete(currentStep.id, currentData);
    }

    if (mode === "edit") {
      // In edit mode, finishing the step usually means we are done
      if (onComplete) onComplete(currentData as Profile);
      return;
    }

    if (currentStepIndex < steps.length - 1) {
      goToNextStep();
    } else {
      if (onComplete) {
        onComplete(currentData as Profile);
      }
    }
  };

  const handleBack = () => {
    if (mode === "edit") {
      if (onCancel) onCancel();
      return;
    }

    if (currentStepIndex > 0) {
      goToPreviousStep();
    } else if (onCancel) {
      onCancel();
    }
  };

  const StepComponent = currentStep?.component;

  if (!StepComponent) {
    return <div>Error: Step component not found</div>;
  }

  return (
    <div className="flexible-wizard">
      {mode === "full" && (
        <div className="wizard-progress">
          <button className="back-button" onClick={handleBack}>
            <Image
              src="/left-arrow.svg"
              alt="Back"
              width={16.5}
              height={16.5}
            />
            {t("back")}
          </button>
          <div className="progress-indicator">
            {steps.map((_, i) => (
              <div
                className="progress-block"
                key={i}
                style={{
                  width: `${100 / steps.length}%`,
                  backgroundColor:
                    i <= currentStepIndex
                      ? "var(--tg-theme-button-color, #2481cc)"
                      : "var(--tg-theme-secondary-bg-color, #efeff3)",
                  opacity: i <= currentStepIndex ? 1 : 0.5,
                }}
              />
            ))}
          </div>
          <div className="step-indicator">
            {currentStepIndex + 1} / {steps.length}
          </div>
        </div>
      )}

      {mode === "edit" && (
        <div className="wizard-header-edit">
          <button className="back-button" onClick={handleBack}>
            <Image
              src="/left-arrow.svg"
              alt="Back"
              width={16.5}
              height={16.5}
            />
            {t("back")}
          </button>
        </div>
      )}

      <div className="wizard-content">
        <StepComponent
          onNext={handleNext}
          // We pass ...currentStep.props if any custom props are needed
          {...currentStep.props}
        />
      </div>
    </div>
  );
}

export function FlexibleWizard({
  steps,
  mode = "full",
  initialStepIndex = 0,
  initialData,
  onComplete,
  onStepComplete,
  onCancel,
}: FlexibleWizardProps) {
  return (
    <WizardProvider
      initialData={initialData}
      initialStepIndex={initialStepIndex}
    >
      <FlexibleWizardInner
        steps={steps}
        mode={mode}
        onComplete={onComplete}
        onStepComplete={onStepComplete}
        onCancel={onCancel}
      />
    </WizardProvider>
  );
}
