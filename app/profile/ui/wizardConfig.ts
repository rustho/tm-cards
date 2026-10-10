import { WizardStepConfig } from "./FlexibleWizard";
import { StepLocation } from "./steps/StepLocation";
import { StepName } from "./steps/StepName";
import { StepDateOfBirth } from "./steps/StepDateOfBirth";
import { StepOccupation } from "./steps/StepOccupation";
import { StepValues } from "./steps/StepValues";
import { StepInterests } from "./steps/StepInterests";
import { StepGoal } from "./steps/StepGoal";
import { StepMeetingFormat } from "./steps/StepMeetingFormat";
import { StepPhoto } from "./steps/StepPhoto";
import { StepAbout } from "./steps/StepAbout";
import { StepTheme } from "./steps/StepTheme";
import { StepFirstMeeting } from "./steps/StepFirstMeeting";

/** Step ids are also listed in ONBOARDING_STEP_IDS (models/admin.ts) for the admin funnel; keep the order in sync. */
export const ONBOARDING_STEPS: WizardStepConfig[] = [
  {
    id: "location",
    component: StepLocation,
    title: "Location",
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
    id: "occupation",
    component: StepOccupation,
    title: "Occupation",
  },
  {
    id: "values",
    component: StepValues,
    title: "Values",
  },
  {
    id: "interests",
    component: StepInterests,
    title: "Interests",
  },
  {
    id: "goal",
    component: StepGoal,
    title: "Goal",
  },
  {
    id: "meetingFormat",
    component: StepMeetingFormat,
    title: "Meeting format",
  },
  {
    id: "about",
    component: StepAbout,
    title: "About",
  },
  {
    id: "photo",
    component: StepPhoto,
    title: "Photo",
  },
  {
    id: "theme",
    component: StepTheme,
    title: "Profile design",
    countsInProgress: false,
  },
  {
    id: "firstMeeting",
    component: StepFirstMeeting,
    title: "First meeting",
    countsInProgress: false,
  },
];
