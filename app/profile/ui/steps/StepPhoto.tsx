"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Upload } from "lucide-react";
import { Button, PhotoUploader } from "@/components/ui";
import { StepProps } from "@/models/types";
import { apiJson } from "@/lib/api";
import { fileToResizedJpeg } from "@/lib/imageUtils";
import { useWizardContext } from "../WizardContext";
import { StepWindow } from "../StepWindow";

/**
 * Step 10 (last): profile photo. Downscaled on the client, uploaded to
 * Supabase Storage via POST /api/profile/photo; the form keeps the URL.
 */
export function StepPhoto({ onNext }: StepProps) {
  const t = useTranslations("profile.steps.photo");
  const { watch, setValue } = useWizardContext();
  const photo = watch("photo") || "";
  const uploaderRef = useRef<HTMLButtonElement>(null);
  const [error, setError] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (file: File) => {
    try {
      setError(false);
      setUploading(true);
      const body = await fileToResizedJpeg(file);
      const { url } = await apiJson<{ url: string }>("/api/profile/photo", {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body,
      });
      setValue("photo", url, { shouldDirty: true });
    } catch (e) {
      console.error("Failed to upload photo:", e);
      setError(true);
    } finally {
      setUploading(false);
    }
  };

  return (
    <StepWindow
      title={t("title")}
      onNext={onNext}
      nextDisabled={!photo || uploading}
      bodyClassName="flex flex-col items-center justify-center gap-8 py-8"
    >
      <PhotoUploader
        ref={uploaderRef}
        src={photo || null}
        onFileSelect={handleFileSelect}
        disabled={uploading}
        aria-label={photo ? t("change") : t("upload")}
        className="w-[60%] max-w-[240px]"
      />
      <div className="flex flex-col items-center gap-6">
        <Button
          variant="outline"
          className="h-12 gap-3 rounded-md border-divider bg-surface px-8 text-counter font-bold text-primary hover:bg-surface/80 [&_svg]:size-5"
          onClick={() => uploaderRef.current?.click()}
          disabled={uploading}
        >
          <Upload aria-hidden />
          {photo ? t("change") : t("upload")}
        </Button>
        <p className="m-0 whitespace-pre-line text-center text-body text-muted-foreground">
          {error ? <span className="text-destructive">{t("error")}</span> : uploading ? t("uploading") : t("hint")}
        </p>
      </div>
    </StepWindow>
  );
}
