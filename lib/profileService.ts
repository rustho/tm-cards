import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { ensureUser, forgetUser, type AuthUser } from "@/lib/auth";
import { TAG_CATEGORIES, userWithProfileInclude, type TagCategory, type UserWithProfile } from "@/lib/profileDto";
import { validateDateOfBirth } from "@/lib/dateUtils";
import { deleteProfilePhoto, isOwnPhotoUrl } from "@/lib/photoStorage";
import { GOAL_IDS, MAX_GOALS, PROFILE_THEMES } from "@/models/types";

/**
 * Write side of the profile API. Accepts the flat shape the wizard sends
 * (the UI `Profile` type plus a few extras) and spreads it over users,
 * profiles, locations and tags.
 */

export class ProfileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProfileValidationError";
  }
}

const MAX_PHOTO_URL_LENGTH = 500;
const MAX_TAGS_PER_CATEGORY = 20;

type Input = Record<string, unknown>;

function optString(input: Input, key: string, max: number): string | null | undefined {
  const value = input[key];
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") throw new ProfileValidationError(`${key} must be a string`);
  const trimmed = value.trim().slice(0, max);
  return trimmed.length > 0 ? trimmed : null;
}

function optStringArray(input: Input, key: string, max: number): string[] | undefined {
  const value = input[key];
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || !value.every((v) => typeof v === "string")) {
    throw new ProfileValidationError(`${key} must be an array of strings`);
  }
  return Array.from(new Set(value.map((v: string) => v.trim()).filter(Boolean))).slice(0, max);
}

/** "YYYY-MM-DD" or "DD.MM.YYYY" → Date (UTC midnight). Throws on invalid / out-of-range age. */
function parseDateOfBirth(raw: string): Date {
  let iso = raw;
  const m = raw.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (m) iso = `${m[3]}-${m[2]}-${m[1]}`;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) throw new ProfileValidationError("dateOfBirth must be YYYY-MM-DD");
  const validation = validateDateOfBirth(iso);
  if (!validation.isValid) throw new ProfileValidationError(validation.errorMessage ?? "Invalid date of birth");
  return new Date(`${iso}T00:00:00.000Z`);
}

export async function getOwnProfile(auth: AuthUser): Promise<UserWithProfile | null> {
  return prisma.user.findUnique({ where: { telegramId: auth.id }, include: userWithProfileInclude });
}

export async function getProfileByTelegramId(telegramId: string): Promise<UserWithProfile | null> {
  return prisma.user.findUnique({ where: { telegramId }, include: userWithProfileInclude });
}

/** Partial upsert of the caller's profile. Only keys present in `input` are written. */
export async function saveProfile(auth: AuthUser, input: Input): Promise<UserWithProfile> {
  const user = await ensureUser(auth);

  // --- referral (first write only) ------------------------------------------------
  const referralCode = optString(input, "referralCode", 64);
  if (referralCode && !user.referrerId) {
    const referrer = await prisma.user.findUnique({ where: { referralCode } });
    if (referrer && referrer.id !== user.id) {
      await prisma.user.update({ where: { id: user.id }, data: { referrerId: referrer.id } });
      forgetUser(auth.id);
    }
  }

  // --- scalar profile fields ------------------------------------------------------
  const data: Prisma.ProfileUncheckedUpdateInput = {};

  const name = optString(input, "name", 100);
  if (name !== undefined) data.name = name;
  const gender = optString(input, "gender", 20);
  if (gender !== undefined) data.gender = gender;
  const occupation = optString(input, "occupation", 80);
  if (occupation !== undefined) data.occupation = occupation;
  const goals = optStringArray(input, "goals", MAX_GOALS);
  if (goals !== undefined) data.goals = goals.filter((g) => GOAL_IDS.includes(g));
  const announcement = optString(input, "announcement", 1000);
  if (announcement !== undefined) data.announcement = announcement;
  const theme = optString(input, "theme", 50);
  if (theme !== undefined && theme !== null) {
    if (!(PROFILE_THEMES as readonly string[]).includes(theme)) {
      throw new ProfileValidationError(`theme must be one of ${PROFILE_THEMES.join(", ")}`);
    }
    data.theme = theme;
  }

  // "about" is called `profile` in the UI type
  const about = input.about !== undefined ? optString(input, "about", 1000) : optString(input, "profile", 1000);
  if (about !== undefined) data.about = about;

  if (input.dateOfBirth !== undefined) {
    const raw = optString(input, "dateOfBirth", 20);
    data.dateOfBirth = raw ? parseDateOfBirth(raw) : null;
  }

  if (input.placesToVisit !== undefined) {
    const value = input.placesToVisit;
    if (Array.isArray(value)) {
      data.placesToVisit = value.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 20);
    } else if (typeof value === "string") {
      data.placesToVisit = value.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 20);
    } else if (value === null) {
      data.placesToVisit = [];
    } else {
      throw new ProfileValidationError("placesToVisit must be a string or array");
    }
  }

  // The file itself goes through POST /api/profile/photo; here only our own
  // Storage URL (unchanged echo from the form) or an empty value is accepted.
  let removedPhoto: string | null = null;
  if (input.photo !== undefined) {
    const current = (await prisma.profile.findUnique({ where: { userId: user.id }, select: { photo: true } }))?.photo;
    // Echo of the stored value (may still be a legacy data URL) is a no-op.
    if (input.photo !== current) {
      const photo = optString(input, "photo", MAX_PHOTO_URL_LENGTH);
      if (photo && !isOwnPhotoUrl(user.id, photo)) {
        throw new ProfileValidationError("photo must be uploaded through /api/profile/photo");
      }
      if (current && current !== photo) removedPhoto = current;
      data.photo = photo;
    }
  }

  const instagram = optString(input, "instagram", 100);
  if (instagram !== undefined) {
    const current = (await prisma.profile.findUnique({ where: { userId: user.id }, select: { socials: true } }))
      ?.socials as Record<string, unknown> | null;
    const socials = { ...(current ?? {}) };
    if (instagram) socials.instagram = instagram.replace(/^@/, "");
    else delete socials.instagram;
    data.socials = socials as Prisma.InputJsonValue;
  }

  // Both the old `isActive` flag and the new name are accepted.
  const complete = input.isComplete ?? input.isActive;
  if (typeof complete === "boolean") data.isComplete = complete;

  // --- location -------------------------------------------------------------------
  if (input.country !== undefined || input.region !== undefined) {
    const country = optString(input, "country", 100);
    const region = optString(input, "region", 100) ?? "";
    if (country === null || (country === undefined && input.region !== undefined)) {
      // explicit clearing, or region without a country: keep whatever location exists unless cleared
      if (country === null) data.locationId = null;
    }
    if (country) {
      const location = await prisma.location.upsert({
        where: { country_region: { country, region } },
        update: {},
        create: { country, region },
      });
      data.locationId = location.id;
    }
  }

  // --- profile row ----------------------------------------------------------------
  await prisma.profile.upsert({
    where: { userId: user.id },
    update: data,
    create: { ...(data as Omit<Prisma.ProfileUncheckedCreateInput, "userId">), userId: user.id },
  });

  if (removedPhoto) await deleteProfilePhoto(removedPhoto);

  // --- matching settings (onboarding "first meeting this week?") ------------------
  if (input.skipNextRound !== undefined) {
    if (typeof input.skipNextRound !== "boolean") throw new ProfileValidationError("skipNextRound must be a boolean");
    await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: { skipNextRound: input.skipNextRound },
      create: { userId: user.id, skipNextRound: input.skipNextRound },
    });
  }

  // --- tags -----------------------------------------------------------------------
  for (const [category, field] of Object.entries(TAG_CATEGORIES) as [TagCategory, string][]) {
    const labels = optStringArray(input, field, MAX_TAGS_PER_CATEGORY);
    if (labels === undefined) continue;
    await replaceTags(user.id, category, labels);
  }

  const result = await prisma.user.findUnique({ where: { id: user.id }, include: userWithProfileInclude });
  if (!result) throw new Error("Profile disappeared during save");
  return result;
}

/** Replaces the profile's tags of one category. Unknown labels are added to the reference list. */
async function replaceTags(profileId: string, category: TagCategory, labels: string[]) {
  if (labels.length > 0) {
    await prisma.tag.createMany({
      data: labels.map((label) => ({ category, label })),
      skipDuplicates: true,
    });
  }
  const tags = labels.length > 0 ? await prisma.tag.findMany({ where: { category, label: { in: labels } } }) : [];

  await prisma.$transaction([
    prisma.profileTag.deleteMany({ where: { profileId, tag: { category } } }),
    ...(tags.length > 0
      ? [prisma.profileTag.createMany({ data: tags.map((t) => ({ profileId, tagId: t.id })), skipDuplicates: true })]
      : []),
  ]);
}
