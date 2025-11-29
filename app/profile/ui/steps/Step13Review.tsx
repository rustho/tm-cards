"use client";

import { useTranslations } from "next-intl";
import { StepContainer } from "@/components";
import { StepProps, Profile } from "@/models/types";
import { useState } from "react";
import { Spinner } from "@telegram-apps/telegram-ui";

export interface Step13ReviewProps extends StepProps {
  data: Profile;
  onUpdate: (data: Profile) => void;
}

export function Step13Review({ data, onUpdate, onNext }: Step13ReviewProps) {
  const t = useTranslations("profile.steps.review");
  const tWizard = useTranslations("profile.wizard");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      onNext();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StepContainer
      title={t("title")}
      onNext={handleSubmit}
      nextText={isSubmitting ? "..." : tWizard("finish")}
      nextDisabled={isSubmitting}
    >
      <div className="review-container">
        {data.photo && (
          <div className="review-photo">
            <img src={data.photo} alt="Profile" />
          </div>
        )}
        <div className="review-details">
          <div className="review-item">
            <strong>{t("name")}</strong> {data.name}
          </div>
          <div className="review-item">
            <strong>{t("interests")}</strong> {data.interests.join(", ")}
          </div>
          <div className="review-item">
            <strong>{t("instagram")}</strong> {data.instagram}
          </div>
          <div className="review-item">
            <strong>{t("location")}</strong> {data.country}, {data.region}
          </div>
          <div className="review-item">
            <strong>{t("request")}</strong> {data.announcement}
          </div>
        </div>
        {error && (
          <div style={{ color: "red", marginTop: "10px" }}>{error}</div>
        )}
      </div>
    </StepContainer>
  );
}
