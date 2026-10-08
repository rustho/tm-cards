import { Caveat, PT_Mono, Press_Start_2P } from "next/font/google";

// Decorative fonts used only inside profile card templates (all with Cyrillic).
// Not preloaded: they are needed only when a card is on screen.

export const caveat = Caveat({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

export const ptMono = PT_Mono({
  subsets: ["latin", "cyrillic"],
  weight: "400",
  display: "swap",
  preload: false,
});

export const pressStart = Press_Start_2P({
  subsets: ["latin", "cyrillic"],
  weight: "400",
  display: "swap",
  preload: false,
});
