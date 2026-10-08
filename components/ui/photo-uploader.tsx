"use client";

import * as React from "react";
import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * XP photo uploader: full-width 3:4 tile with 8px radius.
 * Empty — stroke-grey fill (bg-border) with a centered 84px image icon in
 * text-secondary. Filled — the photo covers the tile (object-cover).
 * The whole tile is a button that opens the file picker; the picked file is
 * passed to `onFileSelect`, the caller owns the preview URL (`src`).
 */
export interface PhotoUploaderProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "onClick"> {
  src?: string | null;
  alt?: string;
  accept?: string;
  onFileSelect: (file: File) => void;
  /** Replaces the default image icon in the empty state. */
  placeholder?: React.ReactNode;
}

const PhotoUploader = React.forwardRef<HTMLButtonElement, PhotoUploaderProps>(
  (
    { className, src, alt = "", accept = "image/*", onFileSelect, placeholder, disabled, type = "button", ...props },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
      // Allow picking the same file again.
      e.target.value = "";
    };

    return (
      <>
        <button
          ref={ref}
          type={type}
          disabled={disabled}
          data-state={src ? "filled" : "empty"}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-md bg-border",
            "text-muted-foreground transition-opacity",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        >
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element -- blob/data URLs
            <img src={src} alt={alt} className="absolute inset-0 size-full object-cover" />
          ) : (
            placeholder ?? <ImageIcon aria-hidden className="size-[84px]" strokeWidth={1.25} />
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden
          className="hidden"
        />
      </>
    );
  }
);
PhotoUploader.displayName = "PhotoUploader";

export { PhotoUploader };
