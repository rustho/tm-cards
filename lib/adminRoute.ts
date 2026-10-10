import { NextRequest, NextResponse } from "next/server";
import { authErrorResponse, requireAdmin, type AuthUser } from "@/lib/auth";
import { AdminError } from "@/lib/adminService";

type Handler<P> = (request: NextRequest, ctx: { admin: AuthUser; params: P }) => Promise<unknown>;

/**
 * Wraps an /api/admin/* handler: requireAdmin() first, the returned value as
 * JSON, AdminError → its status, anything else → 500 `{ error }`.
 */
export function adminRoute<P = Record<string, string>>(name: string, handler: Handler<P>) {
  return async (request: NextRequest, { params }: { params: P }) => {
    try {
      const admin = await requireAdmin(request);
      const result = await handler(request, { admin, params });
      return result instanceof NextResponse ? result : NextResponse.json(result);
    } catch (error) {
      const auth = authErrorResponse(error);
      if (auth) return auth;
      if (error instanceof AdminError) return NextResponse.json({ error: error.message }, { status: error.status });
      console.error(`❌ Admin ${name} failed:`, error);
      return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
    }
  };
}

/** Parsed JSON object body, or AdminError(400). */
export async function jsonBody(request: NextRequest): Promise<Record<string, unknown>> {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new AdminError("Invalid JSON body", 400);
  return body as Record<string, unknown>;
}
