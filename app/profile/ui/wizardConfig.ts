import { WizardStepConfig } from "./FlexibleWizard";
import { StepCountry } from "./steps/StepCountry";
import { StepCity } from "./steps/StepCity";
import { StepName } from "./steps/StepName";
import { StepDateOfBirth } from "./steps/StepDateOfBirth";
import { StepPersonality } from "./steps/StepPersonality";
import { StepInterests } from "./steps/StepInterests";
import { StepHobbies } from "./steps/StepHobbies";
import { StepGoal } from "./steps/StepGoal";
import { StepPhoto } from "./steps/StepPhoto";
import { StepSocials } from "./steps/StepSocials";
import { StepAbout } from "./steps/StepAbout";

export const ONBOARDING_STEPS: WizardStepConfig[] = [
  {
    id: "country",
    component: StepCountry,
    title: "Country",
  },
  {
    id: "region",
    component: StepCity,
    title: "City",
  },
  {
    id: "name",
    component: StepName,
    title: "Name",
  },
  {
    id: "dateOfBirth",
    component: StepDateOfBirth,
    title: "Date of Birth",
  },
  {
    id: "personality",
    component: StepPersonality,
    title: "Personality",
  },
  {
    id: "interests",
    component: StepInterests,
    title: "Interests",
  },
  {
    id: "hobbies",
    component: StepHobbies,
    title: "Hobbies",
  },
  {
    id: "goal",
    component: StepGoal,
    title: "Goal",
  },
  {
    id: "photo",
    component: StepPhoto,
    title: "Photo",
  },
  {
    id: "socials",
    component: StepSocials,
    title: "Social Networks",
  },
  {
    id: "about",
    component: StepAbout,
    title: "About",
  },
];
