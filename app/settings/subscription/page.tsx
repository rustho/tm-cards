"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button, Card, Section } from "@telegram-apps/telegram-ui";

export default function Subscription() {
  const router = useRouter();
  const t = useTranslations('settings.subscription');
  const tCommon = useTranslations('settings.common');

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button
          mode="plain"
          onClick={() => router.back()}
          className="mr-4"
        >
          {tCommon('back')}
        </Button>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
      </div>

      <Section>
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold mb-2">{t('everythingFree')}</h2>
          <p className="text-gray-600 mb-6">
            {t('betaDescription')}
          </p>
        </div>

        <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <h3 className="text-xl font-semibold mb-4">{t('currentPlan')}</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>{t('features.unlimitedProfiles')}</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>{t('features.unlimitedMatches')}</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>{t('features.interactiveGames')}</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>{t('features.allDestinations')}</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>{t('features.prioritySupport')}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6 border-2 border-dashed border-gray-300">
          <h3 className="text-lg font-semibold mb-3">{t('comingSoon')}</h3>
          <p className="text-gray-600 mb-4">
            {t('comingSoonDesc')}
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center">
              <span className="mr-2">🚀</span>
              <span>{t('premiumFeatures.advancedMatching')}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">💬</span>
              <span>{t('premiumFeatures.directMessaging')}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">🎯</span>
              <span>{t('premiumFeatures.locationPreferences')}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">📊</span>
              <span>{t('premiumFeatures.compatibilityInsights')}</span>
            </div>
          </div>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            {t('stayTuned')}
          </p>
        </div>
      </Section>
    </div>
  );
} 