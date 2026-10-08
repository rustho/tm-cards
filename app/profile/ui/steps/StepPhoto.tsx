"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Upload } from "lucide-react";
import { Button, PhotoUploader } from "@/components/ui";
import { StepProps } from "@/models/types";
import { fileToResizedDataUrl } from "@/lib/imageUtils";
import { useWizardContext } from "../WizardContext";
import { StepWindow } from "../StepWindow";

/** Step 10 (last): profile photo, downscaled on the client and stored as a data URL. */
export function StepPhoto({ onNext }: StepProps) {
  const t = useTranslations("profile.steps.photo");
  const { watch, setValue } = useWizardContext();
  const photo = watch("photo") || "";
  const uploaderRef = useRef<HTMLButtonElement>(null);
  const [error, setError] = useState(false);

  const handleFileSelect = async (file: File) => {
    try {
      setError(false);
      setValue("photo", await fileToResizedDataUrl(file), { shouldDirty: true });
    } catch (e) {
      console.error("Failed to process photo:", e);
      setError(true);
    }
  };

  return (
    <StepWindow
      title={t("title")}
      onNext={onNext}
      nextDisabled={!photo}
      bodyClassName="flex flex-col items-center justify-center gap-8 py-8"
    >
      <PhotoUploader
        ref={uploaderRef}
        src={photo || null}
        onFileSelect={handleFileSelect}
        aria-label={photo ? t("change") : t("upload")}
        className="w-[60%] max-w-[240px]"
      />
      <div className="flex flex-col items-center gap-6">
        <Button
          variant="outline"
          className="h-12 gap-3 rounded-md border-divider bg-surface px-8 text-counter font-bold text-primary hover:bg-surface/80 [&_svg]:size-5"
          onClick={() => uploaderRef.current?.click()}
        >
          <Upload aria-hidden />
          {photo ? t("change") : t("upload")}
        </Button>
        <p className="m-0 whitespace-pre-line text-center text-body text-muted-foreground">
          {error ? <span className="text-destructive">{t("error")}</span> : t("hint")}
        </p>
      </div>
    </StepWindow>
  );
}
