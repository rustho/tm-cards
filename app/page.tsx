"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminMenu } from "@/components/AdminMenu";
import { useAuth } from "@/hooks/useAuth";

/** `/`: admins get the admin menu, everyone else lands on the «Встречи» tab. */
export default function Home() {
  const router = useRouter();
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) router.replace("/meetings");
  }, [isAdmin, router]);

  if (!isAdmin) return null;
  return <AdminMenu />;
}
