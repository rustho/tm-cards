"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Progress } from "@telegram-apps/telegram-ui";
import { Step1Name } from "./steps/Step1Name";
import { Step2DateOfBirth } from "./steps/Step2DateOfBirth";
import { Step3Occupation } from "./steps/Step3Occupation";
import { Step4Personality } from "./steps/Step4Personality";
import { Step5Interests } from "./steps/Step5Interests";
import { Step6Hobbies } from "./steps/Step6Hobbies";
import { Step7Travel } from "./steps/Step7Travel";
import { Step8About } from "./steps/Step8About";
import { Step9Instagram } from "./steps/Step9Instagram";
import { Step10Location } from "./steps/Step10Location";
import { Step11Request } from "./steps/Step11Request";
import { Step12Photo } from "./steps/Step12Photo";
import { Step13Review } from "./steps/Step13Review";
import { Profile } from "@/models/types";
import "./FlexibleWizard.css";

const TOTAL_STEPS = 13;

export interface WizardStep {
  id: number;
  name: string;
  completed: boolean;
  required: boolean;
}

interface FlexibleWizardProps {
  mode?: 'full' | 'edit';
  initialStep?: number;
  initialData?: Partial<Profile>;
  onComplete?: (data: Profile) => void;
  onStepComplete?: (step: number, data: Partial<Profile>) => void;
  onCancel?: () => void;
}

export function FlexibleWizard({
  mode = 'full',
  initialStep = 1,
  initialData = {},
  onComplete,
  onStepComplete,
  onCancel,
}: FlexibleWizardProps) {
  const t = useTranslations('profile.wizard');
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [profileData, setProfileData] = useState<Profile>({
    id: "",
    username: "",
    name: "",
    interests: [],
    similarInterests: "",
    announcement: "",
    profile: "",
    placesToVisit: "",
    instagram: "",
    photo: "",
    country: "",
    region: "",
    dateOfBirth: "",
    ...initialData,
  });

  const [steps, setSteps] = useState<WizardStep[]>([
    { id: 1, name: 'Name', completed: false, required: true },
    { id: 2, name: 'Date of Birth', completed: false, required: false },
    { id: 3, name: 'Occupation', completed: false, required: false },
    { id: 4, name: 'Personality', completed: false, required: false },
    { id: 5, name: 'Interests', completed: false, required: true },
    { id: 6, name: 'Hobbies', completed: false, required: false },
    { id: 7, name: 'Travel', completed: false, required: true },
    { id: 8, name: 'About', completed: false, required: false },
    { id: 9, name: 'Instagram', completed: false, required: false },
    { id: 10, name: 'Location', completed: false, required: true },
    { id: 11, name: 'Request', completed: false, required: true },
    { id: 12, name: 'Photo', completed: false, required: false },
    { id: 13, name: 'Review', completed: false, required: true },
  ]);

  // Update step completion status based on data
  useEffect(() => {
    setSteps(prevSteps => prevSteps.map(step => ({
      ...step,
      completed: isStepCompleted(step.id),
    })));
  }, [profileData]);

  const isStepCompleted = (stepId: number): boolean => {
    switch (stepId) {
      case 1: return profileData.name.trim().length >= 2;
      case 5: return profileData.interests.length > 0;
      case 7: return profileData.placesToVisit.trim().length > 0;
      case 10: return profileData.country.trim().length > 0 && profileData.region.trim().length > 0;
      case 11: return profileData.announcement.trim().length > 0;
      case 13: return true; // Review step is always considered complete when reached
      default: return true; // Non-required steps are considered complete by default
    }
  };

  const handleNext = () => {
    if (mode === 'edit') {
      // In edit mode, save the current step and close
      handleStepComplete();
    } else {
      // In full mode, proceed to next step
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handleBack = () => {
    if (mode === 'edit') {
      onCancel?.();
    } else {
      if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const handleStepJump = (stepId: number) => {
    if (mode === 'full') {
      // In full mode, allow jumping to any previous step or next incomplete step
      setCurrentStep(stepId);
    }
  };

  const handleStepComplete = () => {
    onStepComplete?.(currentStep, profileData);
  };

  const handleComplete = () => {
    onComplete?.(profileData);
  };

  const updateProfileData = (data: Partial<Profile>) => {
    setProfileData((prev) => ({ ...prev, ...data }));
  };

  const renderStep = () => {
    const stepProps = {
      onNext: handleNext,
    };

    switch (currentStep) {
      case 1:
        return (
          <Step1Name
            data={profileData.name}
            onUpdate={(name) => updateProfileData({ name })}
            {...stepProps}
          />
        );
      case 2:
        return (
          <Step2DateOfBirth
            data={profileData.dateOfBirth}
            onUpdate={(dateOfBirth) => updateProfileData({ dateOfBirth })}
            {...stepProps}
          />
        );
      case 3:
        return (
          <Step3Occupation
            data={profileData.profile}
            onUpdate={(occupation) => updateProfileData({ profile: profileData.profile })}
            {...stepProps}
          />
        );
      case 4:
        return (
          <Step4Personality
            data={[]}
            onUpdate={(personality) => updateProfileData({ profile: profileData.profile })}
            {...stepProps}
          />
        );
      case 5:
        return (
          <Step5Interests
            data={profileData.interests}
            onUpdate={(interests) => updateProfileData({ interests })}
            {...stepProps}
          />
        );
      case 6:
        return (
          <Step6Hobbies
            data={[]}
            onUpdate={(hobbies) => updateProfileData({ profile: profileData.profile })}
            {...stepProps}
          />
        );
      case 7:
        return (
          <Step7Travel
            data={profileData.placesToVisit}
            onUpdate={(placesToVisit) => updateProfileData({ placesToVisit })}
            {...stepProps}
          />
        );
      case 8:
        return (
          <Step8About
            data={profileData.profile}
            onUpdate={(about) => updateProfileData({ profile: profileData.profile })}
            {...stepProps}
          />
        );
      case 9:
        return (
          <Step9Instagram
            data={profileData.instagram}
            onUpdate={(instagram) => updateProfileData({ instagram })}
            {...stepProps}
          />
        );
      case 10:
        return (
          <Step10Location
            data={{ country: profileData.country, region: profileData.region }}
            onUpdate={(location) =>
              updateProfileData({
                country: location.country,
                region: location.region,
              })
            }
            {...stepProps}
          />
        );
      case 11:
        return (
          <Step11Request
            data={profileData.announcement}
            onUpdate={(announcement) => updateProfileData({ announcement })}
            {...stepProps}
          />
        );
      case 12:
        return (
          <Step12Photo
            data={profileData.photo}
            onUpdate={(photo) => updateProfileData({ photo })}
            {...stepProps}
          />
        );
      case 13:
        return (
          <Step13Review
            data={profileData}
            onUpdate={updateProfileData}
            {...stepProps}
          />
        );
      default:
        return null;
    }
  };

  const renderStepNavigation = () => {
    if (mode === 'edit') return null;

    return (
      <div className="step-navigation">
        {steps.map((step) => (
          <button
            key={step.id}
            className={`step-nav-button ${
              step.id === currentStep ? 'active' : ''
            } ${step.completed ? 'completed' : ''} ${
              step.required ? 'required' : ''
            }`}
            onClick={() => handleStepJump(step.id)}
            disabled={step.id > currentStep && !step.completed}
          >
            {step.id}. {step.name}
            {step.completed && <span className="check-mark">✓</span>}
            {step.required && <span className="required-mark">*</span>}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={`flexible-wizard ${mode}`}>
      {mode === 'full' && (
        <>
          <div className="wizard-progress">
            <Progress value={(currentStep * 100) / TOTAL_STEPS} />
            <div className="step-indicator">
              {t('step')} {currentStep} {t('of')} {TOTAL_STEPS}
            </div>
          </div>
          {renderStepNavigation()}
        </>
      )}
      
      {mode === 'edit' && (
        <div className="edit-mode-header">
          <h3>Edit: {steps.find(s => s.id === currentStep)?.name}</h3>
        </div>
      )}
      
      <div className="wizard-content">{renderStep()}</div>
    </div>
  );
} 