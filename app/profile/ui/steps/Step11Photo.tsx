"use client";

import { Button } from "@telegram-apps/telegram-ui";
import { StepContainer } from "@/components";
import { useState } from "react";
import { ProfileData, StepProps } from "../../types";

// Step 11: Photo
export interface Step11PhotoProps extends StepProps {
  data: ProfileData["photo"];
  onUpdate: (photo: ProfileData["photo"]) => void;
}

export function Step11Photo({
  data,
  onUpdate,
  onNext,
  onBack,
}: Step11PhotoProps) {
  const [preview, setPreview] = useState<string | null>(data);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onUpdate(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <StepContainer
      title="Загрузи свое фото"
      description="Выбери фото, которое лучше всего представляет тебя"
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!data}
    >
      <div className="photo-upload-container">
        {preview ? (
          <div className="photo-preview">
            <img src={preview} alt="Preview" />
            <Button
              size="m"
              mode="outline"
              onClick={() => {
                setPreview(null);
                onUpdate(null);
              }}
            >
              Удалить фото
            </Button>
          </div>
        ) : (
          <label className="photo-upload-label">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="photo-input"
              required
            />
            <Button size="l" mode="outline" stretched>
              Выбрать фото
            </Button>
          </label>
        )}
      </div>
    </StepContainer>
  );
}
