import { useSignal, initData } from "@telegram-apps/sdk-react";
import { ADMIN_TELEGRAM_IDS } from "@/config/constants";

export function useAuth() {
  const user = useSignal(initData.user);
  const isAdmin = ADMIN_TELEGRAM_IDS.includes(user?.id ?? 0);

  return {
    user,
    isAdmin,
    isAuthenticated: !!user,
  };
}
