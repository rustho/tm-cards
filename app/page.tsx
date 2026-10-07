"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminMenu } from "@/components/AdminMenu";
import { MENU_ITEMS } from "@/config/constants";
import { useAuth } from "@/hooks/useAuth";

/** `/`: admins get the admin menu, everyone else lands on the card game. */
export default function Home() {
  const router = useRouter();
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) router.replace(MENU_ITEMS[0].href);
  }, [isAdmin, router]);

  if (!isAdmin) return null;
  return <AdminMenu />;
}
