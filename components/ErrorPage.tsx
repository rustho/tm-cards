"use client";

import { useEffect } from 'react';
import { useTranslations } from "next-intl";

export function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset?: () => void
}) {
  const t = useTranslations('errors');
  const tCommon = useTranslations('common');

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto p-8 text-center">
      <h2 className="text-2xl font-bold mb-4">{t('general')}</h2>
      <blockquote className="bg-gray-100 p-4 rounded-lg mb-4">
        <code className="text-red-600">
          {error.message}
        </code>
      </blockquote>
      {reset && (
        <button 
          onClick={() => reset()}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          {tCommon('back')}
        </button>
      )}
    </div>
  );
}