"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

const NotFoundPage = () => {
  const t = useTranslations('errors');

  return (
    <div className="container mx-auto p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">{t('pageNotFound')}</p>
      <Link href="/home" className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
        {t('goHome')}
      </Link>
    </div>
  );
};

export default NotFoundPage;
