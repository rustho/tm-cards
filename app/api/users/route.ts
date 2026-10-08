import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, authErrorResponse } from "@/lib/auth";
import { toProfile } from "@/lib/profileDto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/users — all active profiles. Admin only. */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const users = await prisma.matchingUser.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(users.map(toProfile));
  } catch (error) {
    const auth = authErrorResponse(error);
    if (auth) return auth;
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
