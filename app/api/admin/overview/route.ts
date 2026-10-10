import { adminRoute } from "@/lib/adminRoute";
import { getOverview } from "@/lib/adminService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/admin/overview — headline numbers for the admin home. */
export const GET = adminRoute("overview", () => getOverview());
