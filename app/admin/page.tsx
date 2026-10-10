"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminMenu } from "@/components/AdminMenu";
import { FooterMenu } from "@/components/FooterMenu";
import { useAuth } from "@/hooks/useAuth";

/** `/admin`: the admin menu, linked from the «Профиль» tab for admins only. */
export default function AdminPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) router.replace("/meetings");
  }, [isAdmin, router]);

  if (!isAdmin) return null;
  return (
    <div className="pb-24">
      <AdminMenu />
      <FooterMenu />
    </div>
  );
}
