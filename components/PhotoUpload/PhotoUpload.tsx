"use client";

import { ReactNode, useRef, ReactElement } from "react";
import "./PhotoUpload.css";

interface PhotoUploadProps {
  preview?: string | null;
  onFileSelect: (file: File) => void;
  children?: ReactNode;
  accept?: string;
}

export function PhotoUpload({
  preview,
  onFileSelect,
  children,
  accept = "image/*",
}: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <>
      <div className="photo-upload" onClick={handleClick}>
        {preview ? (
          <img src={preview} alt="Preview" className="photo-preview" />
        ) : (
          children
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </>
  );
}

