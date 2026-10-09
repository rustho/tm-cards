"use client";

import { ReactNode, useEffect, useState } from "react";
import { BackButton } from "@/components/ui/back-button";
import { ProgressHeader } from "@/components/ui/progress-header";
import "./FlexibleWizard.css";
import { Profile } from "@/models/types";
import { WizardProvider, useWizardContext } from "./WizardContext";

export interface WizardStepConfig {
  id: string;
  component: React.ComponentType<any>;
  title?: string;
  props?: Record<string, any>;
  /** false — the step is not counted in the progress header (e.g. the final design picker). */
  countsInProgress?: boolean;
}

export interface FlexibleWizardProps {
  steps: WizardStepConfig[];
  mode?: "full" | "edit";
  initialStepIndex?: number; // 0-based index
  initialData: Partial<Profile>;
  /** May resolve to `false` when finishing failed (e.g. the save), so the last step can unlock. */
  onComplete?: (data: Profile) => void | Promise<boolean | void>;
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
  const { getValues, currentStepIndex, goToNextStep, goToPreviousStep } =
    useWizardContext();

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = async (): Promise<boolean | void> => {
    const currentData = getValues();

    const finishing = mode === "edit" || isLastStep;

    // The final save already carries the last step's data; a separate step save would only add a slow round trip.
    if (onStepComplete && currentStep && !(finishing && onComplete)) {
      onStepComplete(currentStep.id, currentData);
    }

    if (finishing) {
      if (onComplete) return onComplete(currentData as Profile);
      return;
    }

    goToNextStep();
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

  // Progress counts only the steps that opt in; uncounted steps show the last counted position.
  const counts = (s: WizardStepConfig) => s.countsInProgress !== false;
  const progressTotal = steps.filter(counts).length;
  const progressCurrent = Math.max(1, steps.slice(0, currentStepIndex + 1).filter(counts).length);

  if (!StepComponent) {
    return <div>Error: Step component not found</div>;
  }

  return (
    <div className="flexible-wizard">
      {mode === "full" && (
        <ProgressHeader
          className="wizard-progress"
          current={progressCurrent}
          total={progressTotal}
          onBack={handleBack}
        />
      )}

      {mode === "edit" && (
        <div className="wizard-header-edit">
          <BackButton onClick={handleBack} />
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
