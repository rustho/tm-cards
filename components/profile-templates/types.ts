import type { ComponentType } from "react";
import type { Profile, ProfileTheme } from "@/models/types";

/** Profile fields a card template may render. Everything is optional: the
 * wizard previews a half-filled form, and old profiles may miss fields. */
export type ProfileCardData = Partial<
  Pick<
    Profile,
    | "name"
    | "dateOfBirth"
    | "country"
    | "region"
    | "occupation"
    | "values"
    | "interests"
    | "meetingFormats"
    | "profile"
    | "photo"
  >
>;

export interface ProfileTemplateProps {
  profile: ProfileCardData;
  className?: string;
}

export interface ProfileTemplateDefinition {
  id: ProfileTheme;
  Component: ComponentType<ProfileTemplateProps>;
}
