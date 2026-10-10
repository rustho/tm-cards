import { NextRequest, NextResponse } from "next/server";
import { authenticate, authErrorResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/me — what the client may show for the caller ({ isAdmin }). No DB access. */
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request);
    return NextResponse.json({ isAdmin: auth.isAdmin });
  } catch (error) {
    const authError = authErrorResponse(error);
    if (authError) return authError;
    console.error("Error reading /api/me:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
