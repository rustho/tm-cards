"use client";

import { FixedLayout, IconButton, Tabbar } from "@telegram-apps/telegram-ui";
import { useRouter } from "next/navigation";
export const FooterMenu = () => {
  const router = useRouter();

  return (
    <FixedLayout>
      <Tabbar>
        <Tabbar.Item onClick={() => router.push("/home")}>🏠</Tabbar.Item>
        <Tabbar.Item onClick={() => router.push("/profile")}>👤</Tabbar.Item>
        <Tabbar.Item onClick={() => router.push("/questions")}>💬</Tabbar.Item>
        <Tabbar.Item onClick={() => router.push("/settings")}>⚙️</Tabbar.Item>
      </Tabbar>
    </FixedLayout>
  );
};
