"use client";

import { useState, useRef } from "react";
import { ProfileData, StepProps } from "../../types";

export interface Step12PhotoProps extends StepProps {
  data: ProfileData["photo"];
  onUpdate: (photo: ProfileData["photo"]) => void;
}

export function Step12Photo({
  data,
  onUpdate,
  onNext,
  onBack,
}: Step12PhotoProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data) {
      onNext();
    }
  };

  return (
    <div className="step-container">
      <h2>Пришли свое фото для анкеты.</h2>
      <form onSubmit={handleSubmit}>
        <div
          className="photo-upload"
          onClick={() => fileInputRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="photo-preview" />
          ) : (
            <div>
              <p>Нажмите для загрузки фото</p>
              <p className="step-description">или перетащите файл сюда</p>
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
        <div className="navigation-buttons">
          <button type="button" onClick={onBack}>
            Назад
          </button>
          <button type="submit" disabled={!data}>
            Завершить
          </button>
        </div>
      </form>
    </div>
  );
}
