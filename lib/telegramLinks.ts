"use client";

import { openTelegramLink } from "@tma.js/sdk-react";

/** Opens a t.me link inside Telegram; in a plain browser falls back to a new tab. */
export function openTgLink(url: string) {
  try {
    openTelegramLink(url);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
