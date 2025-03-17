"use client";

import { useState } from "react";
import { Progress } from "@telegram-apps/telegram-ui";
import { Step1Name } from "./steps/Step1Name";
import { Step2Age } from "./steps/Step2Age";
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
import { ProfileData } from "../types";
const TOTAL_STEPS = 13;

export function Wizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    age: "",
    occupation: "",
    personality: [],
    interests: [],
    hobbies: [],
    travel: "",
    about: "",
    instagram: "",
    location: {
      country: "",
      region: "",
    },
    photo: null,
    request: "",
  });

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateProfileData = (data: Partial<ProfileData>) => {
    console.log(data);
    setProfileData((prev) => ({ ...prev, ...data }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Name
            data={profileData.name}
            onUpdate={(name) => updateProfileData({ name })}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <Step2Age
            data={profileData.age.toString()}
            onUpdate={(age) => updateProfileData({ age })}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <Step3Occupation
            data={profileData.occupation}
            onUpdate={(occupation) => updateProfileData({ occupation })}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <Step4Personality
            data={profileData.personality}
            onUpdate={(personality) => updateProfileData({ personality })}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <Step5Interests
            data={profileData.interests}
            onUpdate={(interests) => updateProfileData({ interests })}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 6:
        return (
          <Step6Hobbies
            data={profileData.hobbies}
            onUpdate={(hobbies) => updateProfileData({ hobbies })}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 7:
        return (
          <Step7Travel
            data={profileData.travel}
            onUpdate={(travel) => updateProfileData({ travel })}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 8:
        return (
          <Step8About
            data={profileData.about}
            onUpdate={(about) => updateProfileData({ about })}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 9:
        return (
          <Step9Instagram
            data={profileData.instagram}
            onUpdate={(instagram) => updateProfileData({ instagram })}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 10:
        return (
          <Step10Location
            data={profileData.location}
            onUpdate={(location) => updateProfileData({ location })}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 11:
        return (
          <Step11Request
            data={profileData.request}
            onUpdate={(request) => updateProfileData({ request })}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 12:
        return (
          <Step12Photo
            data={profileData.photo}
            onUpdate={(photo) => updateProfileData({ photo })}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 13:
        return (
          <Step13Review
            data={profileData}
            onUpdate={updateProfileData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="wizard-progress">
        <Progress value={(currentStep * 100) / TOTAL_STEPS} />
        <div className="step-indicator">
          Шаг {currentStep} из {TOTAL_STEPS}
        </div>
      </div>
      <div className="wizard-content">{renderStep()}</div>
    </div>
  );
}
