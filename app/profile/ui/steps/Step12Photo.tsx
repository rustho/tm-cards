"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { StepContainer } from "@/components";
import { Profile, StepProps } from "@/models/types";

export interface Step12PhotoProps extends StepProps {
  data: Profile["photo"];
  onUpdate: (photo: Profile["photo"]) => void;
}

export function Step12Photo({
  data,
  onUpdate,
  onNext,
}: Step12PhotoProps) {
  const t = useTranslations('profile.steps.photo');
  const [preview, setPreview] = useState<string | null>(data);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      title={t('title')}
      onNext={onNext}
      nextDisabled={!data}
    >
      <div
        className="photo-upload"
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="photo-preview" />
        ) : (
          <div>
            <p>{t('upload')}</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
          required
        />
      </div>
    </StepContainer>
  );
}
