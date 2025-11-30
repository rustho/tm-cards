"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { StepContainer } from "@/components";
import { Profile, StepProps } from "@/models/types";

export interface StepPhotoProps extends StepProps {
  data: Partial<Profile>;
  onUpdate: (data: Partial<Profile>) => void;
}

export function StepPhoto({
  data,
  onUpdate,
  onNext,
}: StepPhotoProps) {
  const t = useTranslations('profile.steps.photo');
  const [preview, setPreview] = useState<string | null>(data.photo || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(data.photo || null);
  }, [data.photo]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onUpdate({ photo: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <StepContainer
      title={t('title')}
      onNext={onNext}
      nextDisabled={!preview}
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
