import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const hsl = (token: string) => `hsl(var(--${token}) / <alpha-value>)`;

/**
 * XP UI Foundations (Figma "00 — XP Foundations"). Every color is a CSS
 * variable from app/_assets/globals.css, so the `.dark` class (toggled from the
 * Telegram theme in Root.tsx) switches the whole palette.
 *
 * Colors:     background, card (surface), foreground, muted-foreground,
 *             primary (+ light, muted), success (+ bg), warning, destructive (= danger), border.
 * Type:       text-title 20/26 bold, text-option 17/24, text-counter 16/22, text-body 15/20.
 * Spacing:    4 · 6 · 8 · 11 · 12 · 16 · 20 · 24 px → 1 · 1.5 · 2 · 2.75 · 3 · 4 · 5 · 6.
 * Radius:     rounded-xs 2 · rounded-sm 4 · rounded-md 8 · rounded-xl 26 (rounded-lg = 8 for shadcn).
 * Stroke:     1px (`border`).
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1024px" },
    },
    extend: {
      colors: {
        border: hsl("border"),
        input: hsl("input"),
        ring: hsl("ring"),
        background: hsl("background"),
        foreground: hsl("foreground"),
        surface: hsl("card"),
        card: {
          DEFAULT: hsl("card"),
          foreground: hsl("card-foreground"),
        },
        popover: {
          DEFAULT: hsl("popover"),
          foreground: hsl("popover-foreground"),
        },
        primary: {
          DEFAULT: hsl("primary"),
          foreground: hsl("primary-foreground"),
          light: hsl("primary-light"),
          muted: hsl("primary-muted"),
        },
        secondary: {
          DEFAULT: hsl("secondary"),
          foreground: hsl("secondary-foreground"),
        },
        muted: {
          DEFAULT: hsl("muted"),
          foreground: hsl("muted-foreground"),
        },
        accent: {
          DEFAULT: hsl("accent"),
          foreground: hsl("accent-foreground"),
        },
        success: {
          DEFAULT: hsl("success"),
          foreground: hsl("success-foreground"),
          bg: hsl("success-bg"),
        },
        warning: hsl("warning"),
        destructive: {
          DEFAULT: hsl("destructive"),
          foreground: hsl("destructive-foreground"),
        },
        danger: {
          DEFAULT: hsl("destructive"),
          foreground: hsl("destructive-foreground"),
        },
        action: hsl("color-action"),
        "icon-disabled": hsl("icon-disabled"),
        divider: hsl("divider"),
        "text-disabled": hsl("text-disabled"),
        // Legacy names still used by older screens; not part of the foundation.
        error: hsl("destructive"),
        info: hsl("primary"),
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        title: ["20px", { lineHeight: "26px", fontWeight: "700" }],
        option: ["17px", { lineHeight: "24px" }],
        counter: ["16px", { lineHeight: "22px" }],
        body: ["15px", { lineHeight: "20px" }],
        chip: ["14px", { lineHeight: "20px" }],
        caption: ["13px", { lineHeight: "18px" }],
      },
      spacing: {
        "2.75": "11px",
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-md)",
        xl: "var(--radius-xl)",
      },
      borderWidth: {
        DEFAULT: "1px",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [animate],
};

export default config;
