"use client";

import { useRouter } from "next/navigation";
import { AdminMenu } from "@/components/AdminMenu";
import { MENU_ITEMS } from "@/config/constants";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const router = useRouter();
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    router.push(MENU_ITEMS[0].href);
    return null;
  }

  return <AdminMenu />;
}
