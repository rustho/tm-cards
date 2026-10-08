"use client";

/**
 * Profile card templates ("themes"). The user picks one at the end of
 * onboarding; it is stored in `profiles.theme` and used whenever the card is
 * rendered. Every template is an artwork with the answers laid over it
 * (see image/ImageTemplate.tsx).
 *
 * Adding a template:
 * 1. add its id to PROFILE_THEMES in models/types.ts (the server validates it);
 * 2. put the 1125×2000 artwork at public/profile-templates/<id>.webp, with the
 *    labels and photo window where the existing designs have them;
 * 3. add its name to `profileCard.templates` in both locales.
 */

import { DEFAULT_PROFILE_THEME, PROFILE_THEMES, type ProfileTheme } from "@/models/types";
import { ImageTemplate } from "./image/ImageTemplate";
import type { ProfileTemplateDefinition, ProfileTemplateProps } from "./types";

const TEMPLATES = Object.fromEntries(
  PROFILE_THEMES.map((id) => {
    const Component = (props: ProfileTemplateProps) => <ImageTemplate theme={id} {...props} />;
    Component.displayName = `ProfileTemplate(${id})`;
    return [id, { id, Component }];
  })
) as Record<ProfileTheme, ProfileTemplateDefinition>;

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
