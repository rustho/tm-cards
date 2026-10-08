import type { Prisma } from "@prisma/client";
import type { Profile } from "@/models/types";

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
  hobby: "hobbies",
  trait: "personalityTraits",
} as const;
export type TagCategory = keyof typeof TAG_CATEGORIES;

/** Date → "YYYY-MM-DD" (UTC), "" for null. */
export function formatDateOnly(date: Date | null | undefined): string {
  return date ? date.toISOString().slice(0, 10) : "";
}

/** Maps a user row (with profile, location and tags) to the shape the UI consumes. */
export function toProfile(user: UserWithProfile): Profile {
  const p = user.profile;
  const tagsOf = (category: TagCategory) =>
    p?.tags.filter((t) => t.tag.category === category).map((t) => t.tag.label) ?? [];
  const socials = (p?.socials ?? {}) as Record<string, unknown>;

  return {
    id: user.telegramId,
    username: user.username ?? "",
    name: p?.name ?? [user.firstName, user.lastName].filter(Boolean).join(" "),
    goal: p?.goal ?? "",
    country: p?.location?.country ?? "",
    region: p?.location?.region ?? "",
    interests: tagsOf("interest"),
    hobbies: tagsOf("hobby"),
    personalityTraits: tagsOf("trait"),
    similarInterests: "",
    announcement: p?.announcement ?? "",
    profile: p?.about ?? "",
    placesToVisit: (p?.placesToVisit ?? []).join(", "),
    instagram: typeof socials.instagram === "string" ? socials.instagram : "",
    photo: p?.photo ?? "",
    dateOfBirth: formatDateOnly(p?.dateOfBirth),
  };
}
