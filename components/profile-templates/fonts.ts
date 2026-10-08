import { PT_Mono } from "next/font/google";

// Typewriter font for the answers printed on profile cards (with Cyrillic).
// Not preloaded: it is needed only when a card is on screen.

export const ptMono = PT_Mono({
  subsets: ["latin", "cyrillic"],
  weight: "400",
  display: "swap",
  preload: false,
});
