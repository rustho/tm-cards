import { initData, useSignal } from "@tma.js/sdk-react";
import { ADMIN_TELEGRAM_IDS } from "@/config/constants";

/**
 * Client-side view of the current Telegram user. `isAdmin` only gates UI;
 * every API route re-checks the id server-side (lib/auth.ts).
 */
export function useAuth() {
  const user = useSignal(initData.user);
  const isAdmin = !!user && ADMIN_TELEGRAM_IDS.includes(user.id);

  return {
    user,
    userId: user ? String(user.id) : undefined,
    isAdmin,
    isAuthenticated: !!user,
  };
}
