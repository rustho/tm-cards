"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations('common');

  return (
    <div style={{ background: 'var(--theme-bg-primary)', minHeight: '100vh' }} className="flex items-center justify-center p-8">
      <div className="theme-card text-center max-w-md w-full">
        <div className="text-8xl mb-6">🧭</div>
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--theme-text-primary)' }}>
          404
        </h1>
        <p className="text-xl mb-6" style={{ color: 'var(--theme-text-secondary)' }}>
          {t('pageNotFound')}
        </p>
        <div className="space-y-4">
          <p style={{ color: 'var(--theme-text-secondary)' }}>
            The page you're looking for seems to have wandered off on its own adventure.
          </p>
          <Link href="/home" className="theme-btn-primary inline-block">
            🏠 Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
