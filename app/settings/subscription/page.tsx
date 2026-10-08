"use client";

import { useTranslations } from "next-intl";
import { BackButton } from "@/components/ui/back-button";
import { Card } from "@/components/ui/card";

export default function Subscription() {
  const t = useTranslations('settings.subscription');

  return (
    <div className="container p-4 pb-24">
      <div className="flex items-center mb-6">
        <BackButton className="mr-2" />
        <h1 className="text-2xl font-bold">{t('title')}</h1>
      </div>

      <section>
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold mb-2">{t('everythingFree')}</h2>
          <p className="text-muted-foreground mb-6">
            {t('betaDescription')}
          </p>
        </div>

        <Card className="p-6 mb-6 bg-primary/10">
          <h3 className="text-xl font-semibold mb-4">{t('currentPlan')}</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-success mr-2">✓</span>
              <span>{t('features.unlimitedProfiles')}</span>
            </div>
            <div className="flex items-center">
              <span className="text-success mr-2">✓</span>
              <span>{t('features.unlimitedMatches')}</span>
            </div>
            <div className="flex items-center">
              <span className="text-success mr-2">✓</span>
              <span>{t('features.interactiveGames')}</span>
            </div>
            <div className="flex items-center">
              <span className="text-success mr-2">✓</span>
              <span>{t('features.allDestinations')}</span>
            </div>
            <div className="flex items-center">
              <span className="text-success mr-2">✓</span>
              <span>{t('features.prioritySupport')}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6 border-2 border-dashed">
          <h3 className="text-lg font-semibold mb-3">{t('comingSoon')}</h3>
          <p className="text-muted-foreground mb-4">
            {t('comingSoonDesc')}
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
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
          <p className="text-sm text-muted-foreground">
            {t('stayTuned')}
          </p>
        </div>
      </section>
    </div>
  );
} 