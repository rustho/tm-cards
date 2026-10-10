import { adminRoute } from "@/lib/adminRoute";
import { getRound } from "@/lib/adminMatching";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/admin/matching/rounds/[roundId] — a round with every pair, accepts and feedback. */
export const GET = adminRoute<{ roundId: string }>("round", (_request, { params }) => getRound(params.roundId));
