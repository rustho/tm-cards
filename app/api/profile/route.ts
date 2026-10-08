import { NextRequest, NextResponse } from "next/server";
import { authenticate, authErrorResponse } from "@/lib/auth";
import { toProfile } from "@/lib/profileDto";
import { getOwnProfile, ProfileValidationError, saveProfile } from "@/lib/profileService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/profile — the authenticated user's own profile (404 until the wizard has saved something). */
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request);
    const user = await getOwnProfile(auth);
    if (!user?.profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    return NextResponse.json(toProfile(user));
  } catch (error) {
    const authError = authErrorResponse(error);
    if (authError) return authError;
    console.error("Error fetching own profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/profile — partial upsert of the caller's profile.
 * Body: any subset of the UI `Profile` fields plus `isComplete` and `referralCode`.
 * The user id comes from the validated init data; any `id` in the body is ignored.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request);
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const user = await saveProfile(auth, body as Record<string, unknown>);
    return NextResponse.json({ success: true, profile: toProfile(user) });
  } catch (error) {
    const authError = authErrorResponse(error);
    if (authError) return authError;
    if (error instanceof ProfileValidationError) {
      const status = error.message === "Photo is too large" ? 413 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    console.error("Error saving profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
