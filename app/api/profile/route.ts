import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, authErrorResponse } from "@/lib/auth";
import { toProfile } from "@/lib/profileDto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Age from "YYYY-MM-DD" or "DD.MM.YYYY"; null when unparsable. */
function calculateAge(dateString: string): number | null {
  if (!dateString) return null;
  let birthDate: Date;
  if (dateString.includes(".")) {
    const parts = dateString.split(".");
    if (parts.length !== 3) return null;
    birthDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  } else {
    birthDate = new Date(dateString);
  }
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

const MAX_PHOTO_LENGTH = 2_000_000; // ~1.5 MB base64

/** GET /api/profile — the authenticated user's own profile (404 if not created yet). */
export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    const row = await prisma.matchingUser.findUnique({ where: { telegramId: user.id } });
    if (!row) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    return NextResponse.json(toProfile(row));
  } catch (error) {
    const auth = authErrorResponse(error);
    if (auth) return auth;
    console.error("Error fetching own profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/profile — partial upsert of the authenticated user's profile.
 * The user id comes from the validated init data; any `id` in the body is ignored.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    const data = await request.json().catch(() => null);
    if (!data || typeof data !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const update: Record<string, unknown> = {};
    const str = (key: string, max = 1000) => {
      if (data[key] === undefined) return;
      if (data[key] !== null && typeof data[key] !== "string") {
        throw new ValidationError(`${key} must be a string`);
      }
      update[key] = data[key] === null ? null : String(data[key]).slice(0, max);
    };
    const strArray = (key: string, max = 20) => {
      if (data[key] === undefined) return;
      if (!Array.isArray(data[key]) || !data[key].every((v: unknown) => typeof v === "string")) {
        throw new ValidationError(`${key} must be an array of strings`);
      }
      update[key] = data[key].slice(0, max);
    };

    str("username", 100);
    str("name", 100);
    str("country", 100);
    str("region", 100);
    str("goal", 100);
    str("instagram", 100);
    str("announcement", 1000);
    str("gender", 20);
    strArray("interests");
    strArray("hobbies");
    strArray("personalityTraits");

    if (data.dateOfBirth !== undefined) {
      str("dateOfBirth", 20);
      const age = calculateAge(String(data.dateOfBirth ?? ""));
      if (age !== null) update.age = age;
    }

    if (data.placesToVisit !== undefined) {
      if (Array.isArray(data.placesToVisit)) {
        update.placesToVisit = data.placesToVisit.map(String).slice(0, 20);
      } else if (typeof data.placesToVisit === "string") {
        update.placesToVisit = data.placesToVisit
          .split(",")
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0)
          .slice(0, 20);
      } else {
        throw new ValidationError("placesToVisit must be a string or array");
      }
    }

    if (data.photo !== undefined) {
      if (typeof data.photo === "string" && data.photo.length > MAX_PHOTO_LENGTH) {
        return NextResponse.json({ error: "Photo is too large" }, { status: 413 });
      }
      str("photo", MAX_PHOTO_LENGTH);
    }

    // "about" is stored in the `profile` column
    if (data.profile !== undefined) str("profile", 1000);
    else if (data.about !== undefined) {
      data.profile = data.about;
      str("profile", 1000);
    }

    if (typeof data.isActive === "boolean") update.isActive = data.isActive;

    const row = await prisma.matchingUser.upsert({
      where: { telegramId: user.id },
      update,
      create: {
        telegramId: user.id,
        username: user.username ?? null,
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || null,
        ...update,
        interests: (update.interests as string[]) ?? [],
        hobbies: (update.hobbies as string[]) ?? [],
        personalityTraits: (update.personalityTraits as string[]) ?? [],
        placesToVisit: (update.placesToVisit as string[]) ?? [],
        previousMatches: [],
      },
    });

    return NextResponse.json({ success: true, profile: toProfile(row) });
  } catch (error) {
    const auth = authErrorResponse(error);
    if (auth) return auth;
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error saving profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

class ValidationError extends Error {}
