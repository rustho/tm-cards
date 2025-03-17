"use client";

import { StepContainer } from "@/components";
import { StepProps, ProfileData } from "../../types";

export interface Step13ReviewProps extends StepProps {
  data: ProfileData;
  onUpdate: (data: ProfileData) => void;
}

export function Step13Review({
  data,
  onUpdate,
  onNext,
  onBack,
}: Step13ReviewProps) {
  return (
    <StepContainer
      title="Проверь свои данные"
      description="Убедись, что все информация корректна"
      onBack={onBack}
      onNext={onNext}
      nextText="Завершить"
    >
      <div className="review-container">
        {data.photo && (
          <div className="review-photo">
            <img src={data.photo} alt="Profile" />
          </div>
        )}
        <div className="review-details">
          <div className="review-item">
            <strong>Имя:</strong> {data.name}
          </div>
          <div className="review-item">
            <strong>Возраст:</strong> {data.age}
          </div>
          <div className="review-item">
            <strong>Профессия:</strong> {data.occupation}
          </div>
          <div className="review-item">
            <strong>Черты характера:</strong> {data.personality.join(", ")}
          </div>
          <div className="review-item">
            <strong>Интересы:</strong> {data.interests.join(", ")}
          </div>
          <div className="review-item">
            <strong>Хобби:</strong> {data.hobbies.join(", ")}
          </div>
          <div className="review-item">
            <strong>Планы на путешествие:</strong> {data.travel}
          </div>
          <div className="review-item">
            <strong>О себе:</strong> {data.about}
          </div>
          <div className="review-item">
            <strong>Instagram:</strong> {data.instagram}
          </div>
          <div className="review-item">
            <strong>Город:</strong> {data.location.country},{" "}
            {data.location.region}
          </div>
        </div>
      </div>
    </StepContainer>
  );
}
