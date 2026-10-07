import type { MatchingUser } from "@prisma/client";
import type { Profile } from "@/models/types";

/**
 * Maps a MatchingUser row to the shape the UI works with (`Profile` in
 * models/types.ts). Keeps matching internals (previousMatches, preferences,
 * flags) out of API responses.
 */
export function toProfile(user: MatchingUser): Profile {
  return {
    id: user.telegramId,
    username: user.username ?? "",
    name: user.name ?? "",
    goal: user.goal ?? "",
    country: user.country ?? "",
    region: user.region ?? "",
    interests: user.interests ?? [],
    hobbies: user.hobbies ?? [],
    personalityTraits: user.personalityTraits ?? [],
    similarInterests: "",
    announcement: user.announcement ?? "",
    profile: user.profile ?? "",
    placesToVisit: (user.placesToVisit ?? []).join(", "),
    instagram: user.instagram ?? "",
    photo: user.photo ?? "",
    dateOfBirth: user.dateOfBirth ?? "",
  };
}
