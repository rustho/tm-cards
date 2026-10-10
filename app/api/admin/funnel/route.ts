import { adminRoute } from "@/lib/adminRoute";
import { getFunnel } from "@/lib/adminFunnel";
import { FUNNEL_PERIODS, FUNNEL_SOURCES, type FunnelPeriod, type FunnelSource } from "@/models/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/admin/funnel?period=7|30|90|365|all&source=all|referral|organic — `FunnelDto`. */
export const GET = adminRoute("funnel", (request) => {
  const params = request.nextUrl.searchParams;
  const pick = <T extends string>(value: string | null, allowed: readonly T[], fallback: T): T =>
    allowed.includes(value as T) ? (value as T) : fallback;
  return getFunnel(pick(params.get("period"), FUNNEL_PERIODS, "30"), pick(params.get("source"), FUNNEL_SOURCES, "all"));
});
