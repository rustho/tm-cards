"use client";

import { useTranslations } from "next-intl";
import { FooterMenu } from "@/components/FooterMenu";
import "./pageStyles.css";
import { Wizard } from "./ui/Wizard";

export default function Profile() {
  const t = useTranslations('profile');

  return (
    <div style={{ background: 'var(--theme-bg-primary)', minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--theme-text-primary)' }}>
            👤 {t('title')}
          </h1>
          <p className="text-lg" style={{ color: 'var(--theme-text-secondary)' }}>
            Create your travel companion profile
          </p>
        </div>
        
        <div className="theme-card mb-20">
          <Wizard />
        </div>
      </div>
      <FooterMenu />
    </div>
  );
}
