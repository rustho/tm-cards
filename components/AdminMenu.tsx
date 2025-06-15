"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function AdminMenu() {
  const t = useTranslations('menu');
  
  const menuItems = [
    {
      title: t('questions'),
      href: "/questions",
    },
    {
      title: t('profile'),
      href: "/profile",
    },
    {
      title: t('home'),
      href: "/home",
    },
    {
      title: t('settings'),
      href: "/settings",
    },
  ];

  return (
    <div className="container mx-auto p-8">
      {menuItems.map((item) => (
        <Link key={item.href} href={item.href} className="group block mb-4">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
          </div>
        </Link>
      ))}
    </div>
  );
} 