import type { Prisma } from "@prisma/client";
import { PROFILE_THEMES, type Profile } from "@/models/types";

/** Include needed to build the UI `Profile` from a `User` row. */
export const userWithProfileInclude = {
  profile: {
    include: {
      location: true,
      tags: { include: { tag: true }, orderBy: { tag: { sortOrder: "asc" } } },
    },
  },
} satisfies Prisma.UserInclude;

export type UserWithProfile = Prisma.UserGetPayload<{ include: typeof userWithProfileInclude }>;

/** Tag categories in the DB ↔ array fields in the UI `Profile` type. */
export const TAG_CATEGORIES = {
  interest: "interests",
  value: "values",
  format: "meetingFormats",
} as const;
export type TagCategory = keyof typeof TAG_CATEGORIES;

/** Date → "YYYY-MM-DD" (UTC), "" for null. */
export function formatDateOnly(date: Date | null | undefined): string {
  return date ? date.toISOString().slice(0, 10) : "";
}

/**
 * Maps a user row (with profile, location and tags) to the shape the UI consumes.
 * Private fields (`goals`) are included only with `includePrivate` — pass it
 * for the caller's own profile, never for other users.
 */
export function toProfile(user: UserWithProfile, { includePrivate = false } = {}): Profile {
  const p = user.profile;
  const tagsOf = (category: TagCategory) =>
    p?.tags.filter((t) => t.tag.category === category).map((t) => t.tag.label) ?? [];
  const socials = (p?.socials ?? {}) as Record<string, unknown>;

  return {
    id: user.telegramId,
    username: user.username ?? "",
    name: p?.name ?? [user.firstName, user.lastName].filter(Boolean).join(" "),
    goals: includePrivate ? p?.goals ?? [] : [],
    country: p?.location?.country ?? "",
    region: p?.location?.region ?? "",
    interests: tagsOf("interest"),
    values: tagsOf("value"),
    meetingFormats: tagsOf("format"),
    similarInterests: "",
    announcement: p?.announcement ?? "",
    profile: p?.about ?? "",
    placesToVisit: (p?.placesToVisit ?? []).join(", "),
    instagram: typeof socials.instagram === "string" ? socials.instagram : "",
    photo: p?.photo ?? "",
    dateOfBirth: formatDateOnly(p?.dateOfBirth),
    occupation: p?.occupation ?? "",
    // The column defaults to "default" (pre-template rows); expose only real template ids.
    theme: (PROFILE_THEMES as readonly string[]).includes(p?.theme ?? "") ? p!.theme : "",
    ...(includePrivate ? { isComplete: p?.isComplete ?? false } : {}),
  };
}
