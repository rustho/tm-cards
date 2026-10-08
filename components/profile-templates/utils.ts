import { calculateAge } from "@/lib/dateUtils";
import { INTEREST_GROUPS } from "@/models/types";
import type { ProfileCardData } from "./types";

/** Age in years, or null when the date is missing or invalid. */
export function getAge({ dateOfBirth }: ProfileCardData): number | null {
  if (!dateOfBirth) return null;
  try {
    return calculateAge(dateOfBirth);
  } catch {
    return null;
  }
}

/** Interest groups that read as conversation topics rather than hobbies. */
const TALK_GROUPS = new Set(["Идеи и общество", "Технологии и бизнес"]);
const TALK_INTERESTS = new Set<string>(
  INTEREST_GROUPS.filter((g) => TALK_GROUPS.has(g.title)).flatMap((g) => g.options.map((o) => o.label))
);

/** Splits interests for the "О чем интересно поговорить" / "Чем увлекаюсь" fields. */
export function splitInterests({ interests = [] }: ProfileCardData): { talk: string[]; hobbies: string[] } {
  return {
    talk: interests.filter((i) => TALK_INTERESTS.has(i)),
    hobbies: interests.filter((i) => !TALK_INTERESTS.has(i)),
  };
}
