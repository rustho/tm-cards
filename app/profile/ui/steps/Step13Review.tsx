"use client";

import { useTranslations } from "next-intl";
import { StepContainer } from "@/components";
import { StepProps, Profile } from "@/models/types";

export interface Step13ReviewProps extends StepProps {
  data: Profile;
  onUpdate: (data: Profile) => void;
}

export function Step13Review({
  data,
  onUpdate,
  onNext,
}: Step13ReviewProps) {
  const t = useTranslations('profile.steps.review');
  const tWizard = useTranslations('profile.wizard');

  return (
    <StepContainer
      title={t('title')}
      description={t('description')}
      onNext={onNext}
      nextText={tWizard('finish')}
    >
      <div className="review-container">
        {data.photo && (
          <div className="review-photo">
            <img src={data.photo} alt="Profile" />
          </div>
        )}
        <div className="review-details">
          <div className="review-item">
            <strong>{t('name')}</strong> {data.name}
          </div>
          {/* <div className="review-item">
            <strong>{t('age')}</strong> {data.age}
          </div>
          <div className="review-item">
            <strong>{t('occupation')}</strong> {data.occupation}
          </div>
          <div className="review-item">
            <strong>{t('personality')}</strong> {data.personality.join(", ")}
          </div> */}
          <div className="review-item">
            <strong>{t('interests')}</strong> {data.interests.join(", ")}
          </div>
          {/* <div className="review-item">
            <strong>{t('hobbies')}</strong> {data.hobbies.join(", ")}
          </div>
          <div className="review-item">
            <strong>{t('travel')}</strong> {data.travel}
          </div>
          <div className="review-item">
            <strong>{t('about')}</strong> {data.about}
          </div> */}
          <div className="review-item">
            <strong>{t('instagram')}</strong> {data.instagram}
          </div>
          <div className="review-item">
            <strong>{t('location')}</strong> {data.country}, {data.region}
          </div>
          <div className="review-item">
            <strong>{t('request')}</strong> {data.announcement}
          </div>
        </div>
      </div>
    </StepContainer>
  );
}
