"use client";

import { useTranslations } from "next-intl";

export default function EndGame() {
  const t = useTranslations('questions');

  const End = () => {
    return (
      <div className="page">
        <div className="card">
          <div className={`card-content ${"light-gray-paper"}`}>
            <h1>{t('gameEnded')}</h1>
            <p>{t('thankYou')}</p>
          </div>
        </div>
      </div>
    );
  };

  return <End />;
}
