"use client";

import { useEffect, type PropsWithChildren } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loading } from "@/components/admin/AdminUI";

/** Gate for every /admin page: UI only, each /api/admin route re-checks with requireAdmin(). */
export default function AdminLayout({ children }: PropsWithChildren) {
  const router = useRouter();
  const { isAdmin, isAdminKnown } = useAuth();

  useEffect(() => {
    if (isAdminKnown && !isAdmin) router.replace("/meetings");
  }, [isAdmin, isAdminKnown, router]);

  if (!isAdmin) return isAdminKnown ? null : <Loading />;
  return <>{children}</>;
}
