"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { StepContainer, PhotoUpload } from "@/components";
import { StepProps } from "@/models/types";
import { useWizardContext } from "../WizardContext";

export interface StepPhotoProps extends StepProps {}

export function StepPhoto({ onNext }: StepPhotoProps) {
  const t = useTranslations('profile.steps.photo');
  const { watch, setValue } = useWizardContext();
  const photo = watch("photo");
  const [preview, setPreview] = useState<string | null>(photo || null);

  useEffect(() => {
    setPreview(photo || null);
  }, [photo]);

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreview(base64String);
      setValue("photo", base64String, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
  };

  return (
    <StepContainer
      title={t('title')}
      onNext={onNext}
      nextDisabled={!preview}
    >
      <PhotoUpload preview={preview} onFileSelect={handleFileSelect}>
        <div>
          <p>{t('upload')}</p>
        </div>
      </PhotoUpload>
    </StepContainer>
  );
}
