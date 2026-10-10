import { adminRoute } from "@/lib/adminRoute";
import { listUsers } from "@/lib/adminService";
import { USER_FILTERS, type UserFilter } from "@/models/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/admin/users?q=&filter=&offset= — newest first, 50 per page. */
export const GET = adminRoute("users", (request) => {
  const params = request.nextUrl.searchParams;
  const filter = params.get("filter") ?? "all";
  return listUsers({
    q: params.get("q") ?? "",
    filter: (USER_FILTERS as readonly string[]).includes(filter) ? (filter as UserFilter) : "all",
    offset: Math.max(0, parseInt(params.get("offset") ?? "0", 10) || 0),
  });
});
