import { adminRoute } from "@/lib/adminRoute";
import { getAudience, parseSegment } from "@/lib/broadcastService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/admin/broadcasts/audience?segment=&country= — { total, reachable } for the composer. */
export const GET = adminRoute("audience", (request) => {
  const params = request.nextUrl.searchParams;
  return getAudience(parseSegment({ id: params.get("segment"), country: params.get("country") }));
});
