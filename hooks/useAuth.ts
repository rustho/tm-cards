import { initData, useSignal } from "@tma.js/sdk-react";
import { useCachedApi } from "@/lib/apiCache";

/**
 * Client-side view of the current Telegram user. `isAdmin` comes from GET /api/me
 * (admin ids live in the server env) and only gates UI; every admin API route
 * re-checks it with requireAdmin(). `isAdmin` is false until the first answer.
 */
export function useAuth() {
  const user = useSignal(initData.user);
  const { data: me } = useCachedApi<{ isAdmin: boolean }>(user ? "/api/me" : null);

  return {
    user,
    userId: user ? String(user.id) : undefined,
    isAdmin: me?.isAdmin ?? false,
    /** True once /api/me answered (or was cached), so pages can tell "not admin" from "not known yet". */
    isAdminKnown: me !== undefined,
    isAuthenticated: !!user,
  };
}
