import { calculateAge } from "@/lib/dateUtils";
import type { ProfileCardData } from "./types";

/** "Сербия, Белград" / "Бали"; empty string when unknown. */
export function formatLocation({ country, region }: ProfileCardData, separator = ", "): string {
  return [country, region].filter(Boolean).join(separator);
}

/** Age in years, or null when the date is missing or invalid. */
export function getAge({ dateOfBirth }: ProfileCardData): number | null {
  if (!dateOfBirth) return null;
  try {
    return calculateAge(dateOfBirth);
  } catch {
    return null;
  }
}
