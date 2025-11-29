"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function AdminMenu() {
  const t = useTranslations('menu');
  
  const menuItems = [
    {
      title: t('questions'),
      href: "/icebreaker",
      icon: "🎮",
      description: "Play interactive question cards"
    },
    {
      title: t('profile'),
      href: "/profile",
      icon: "👤",
      description: "Create and manage your profile"
    },
    {
      title: t('home'),
      href: "/home",
      icon: "🏠",
      description: "View your matches and dashboard"
    },
    {
      title: t('settings'),
      href: "/settings",
      icon: "⚙️",
      description: "Manage your preferences"
    },
  ];

  return (
    <div style={{ background: 'var(--theme-bg-primary)', minHeight: '100vh' }} className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--theme-text-primary)' }}>
            🧭 Admin Menu
          </h1>
          <p className="text-lg" style={{ color: 'var(--theme-text-secondary)' }}>
            Navigate to different sections
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className="group block">
              <div className="theme-card group-hover:transform group-hover:scale-105">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">{item.icon}</span>
                  <h2 className="text-xl font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                    {item.title}
                  </h2>
                </div>
                <p style={{ color: 'var(--theme-text-secondary)' }}>
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 