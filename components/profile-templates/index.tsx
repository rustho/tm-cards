"use client";

/**
 * Profile card templates ("themes"). The user picks one at the end of
 * onboarding; it is stored in `profiles.theme` and used whenever the card is
 * rendered.
 *
 * Adding a template:
 * 1. add its id to PROFILE_THEMES in models/types.ts (the server validates it);
 * 2. create `<id>/<Name>Template.tsx` taking ProfileTemplateProps;
 * 3. register it below and add its name to `profileCard.templates` in both locales.
 */

import { DEFAULT_PROFILE_THEME, PROFILE_THEMES, type ProfileTheme } from "@/models/types";
import { NotebookTemplate } from "./notebook/NotebookTemplate";
import { RetroTemplate } from "./retro/RetroTemplate";
import type { ProfileTemplateDefinition, ProfileTemplateProps } from "./types";

const TEMPLATES: Record<ProfileTheme, ProfileTemplateDefinition> = {
  notebook: { id: "notebook", Component: NotebookTemplate },
  retro: { id: "retro", Component: RetroTemplate },
};

/** Templates in display order. */
export const PROFILE_TEMPLATES: ProfileTemplateDefinition[] = PROFILE_THEMES.map((id) => TEMPLATES[id]);

/** Resolves a stored theme to a template; unknown or empty ids fall back to the default. */
export function getProfileTemplate(theme: string | null | undefined): ProfileTemplateDefinition {
  return TEMPLATES[theme as ProfileTheme] ?? TEMPLATES[DEFAULT_PROFILE_THEME];
}

/** Renders a profile card with the template for `theme`. */
export function ProfileCard({ theme, ...props }: ProfileTemplateProps & { theme?: string | null }) {
  const { Component } = getProfileTemplate(theme);
  return <Component {...props} />;
}

export type { ProfileCardData, ProfileTemplateProps, ProfileTemplateDefinition } from "./types";
