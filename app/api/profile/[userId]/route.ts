import { NextRequest, NextResponse } from "next/server";
import { authenticate, authErrorResponse } from "@/lib/auth";
import { toProfile } from "@/lib/profileDto";
import { getProfileByTelegramId } from "@/lib/profileService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/profile/[userId] — another user's public profile (userId = Telegram id). */
export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const auth = await authenticate(request);
    const user = await getProfileByTelegramId(params.userId);
    const visible =
      user?.profile && user.status === "active" && (user.profile.isComplete || auth.isAdmin || auth.id === params.userId);
    if (!user || !visible) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    return NextResponse.json(toProfile(user));
  } catch (error) {
    const authError = authErrorResponse(error);
    if (authError) return authError;
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
