"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { Profile } from "@/models/types";

export interface WizardContextValue extends UseFormReturn<Partial<Profile>> {
  currentStepIndex: number;
  setCurrentStepIndex: (index: number) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

const WizardContext = createContext<WizardContextValue | undefined>(undefined);

export interface WizardProviderProps {
  children: ReactNode;
  initialData: Partial<Profile>;
  initialStepIndex?: number;
  onDataChange?: (data: Partial<Profile>) => void;
}

export function WizardProvider({
  children,
  initialData,
  initialStepIndex = 0,
  onDataChange,
}: WizardProviderProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStepIndex);

  const form = useForm<Partial<Profile>>({
    defaultValues: initialData,
    mode: "onChange", // Validate on change for better UX
  });

  // Watch all form values and notify parent of changes
  const formValues = form.watch();
  useEffect(() => {
    if (onDataChange) {
      onDataChange(formValues);
    }
  }, [formValues, onDataChange]);

  // Sync initialData if it changes externally
  useEffect(() => {
    form.reset(initialData);
  }, [initialData, form]);

  const goToNextStep = () => {
    setCurrentStepIndex((prev) => prev + 1);
  };

  const goToPreviousStep = () => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  const value: WizardContextValue = {
    ...form,
    currentStepIndex,
    setCurrentStepIndex,
    goToNextStep,
    goToPreviousStep,
  };

  return (
    <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
  );
}

export function useWizardContext(): WizardContextValue {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error("useWizardContext must be used within a WizardProvider");
  }
  return context;
}
