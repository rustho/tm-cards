import { Inter } from "next/font/google";

// XP Foundations: Inter Regular (400) and Inter Bold (700) only.
export const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  variable: "--font-inter",
  display: "swap",
});
