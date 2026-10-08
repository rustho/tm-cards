import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, authErrorResponse } from "@/lib/auth";
import { toProfile, userWithProfileInclude } from "@/lib/profileDto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/users[?all=1] — completed profiles (or every user with `all=1`). Admin only. */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const all = request.nextUrl.searchParams.get("all") === "1";
    const users = await prisma.user.findMany({
      where: all ? {} : { status: "active", profile: { isComplete: true } },
      include: userWithProfileInclude,
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(users.map(toProfile));
  } catch (error) {
    const authError = authErrorResponse(error);
    if (authError) return authError;
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
