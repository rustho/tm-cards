"use client";

import { useTranslations } from "next-intl";
import { StepContainer } from "@/components";
import { StepProps, Profile } from "@/models/types";
import { useState } from "react";
import { useWizardContext } from "../WizardContext";
import "./Step13Review.css";

export interface Step13ReviewProps extends StepProps {}

export function Step13Review({ onNext }: Step13ReviewProps) {
  const t = useTranslations("profile.steps.review");
  const tWizard = useTranslations("profile.wizard");
  const { getValues } = useWizardContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const data = getValues() as Profile;
      
      // Validate that we have an ID before submitting
      if (!data.id || data.id === "") {
        setError("User ID is missing. Please refresh the page and try again.");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Failed to save profile (${response.status})`;
        console.error("API Error:", errorMessage, "Response:", errorData);
        throw new Error(errorMessage);
      }

      onNext();
    } catch (err: any) {
      console.error("Error submitting profile:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const data = getValues() as Profile;

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
            <strong>{t("interests")}</strong> {data.interests?.join(", ") || ""}
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
