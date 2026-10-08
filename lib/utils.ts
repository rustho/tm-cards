import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge the XP type scale (tailwind.config.ts → fontSize);
// otherwise `text-option` is treated as a color and dropped next to `text-muted-foreground`.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["title", "option", "counter", "body", "chip", "caption"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
