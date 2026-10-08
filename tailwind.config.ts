import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

/**
 * Two layers of tokens live here:
 * - shadcn/ui semantic tokens (background, foreground, primary, ...) backed by
 *   HSL CSS variables in app/_assets/globals.css, switched by the `.dark` class.
 * - the TravelMate brand palette (primary-50..900, accent-*, bg-*, muted-*) kept
 *   for existing components and gradients.
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          light: "#7FA7D1",
          dark: "#4A7AA3",
          50: "#F0F6FC",
          100: "#E1EDF9",
          200: "#C4DBF3",
          300: "#A7C8ED",
          400: "#8AB6E7",
          500: "#5D90C0",
          600: "#4A7AA3",
          700: "#3A6085",
          800: "#2A4768",
          900: "#1A2F4A",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          light: "#C4D4E5",
          dark: "#9ABACF",
          500: "#AFC7DA",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          light: "#A1CDB9",
          dark: "#71B3A1",
          500: "#89C3AD",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
          500: "#8DA4B1",
        },
        bg: {
          DEFAULT: "#D4E2EC",
          light: "#E1EBF3",
          dark: "#C7D9E5",
          primary: "#D4E2EC",
          secondary: "#EAF1F6",
          tertiary: "#F5F8FA",
        },
        success: { DEFAULT: "#10B981", light: "#34D399", dark: "#059669" },
        warning: { DEFAULT: "#F59E0B", light: "#FBBF24", dark: "#D97706" },
        error: { DEFAULT: "#EF4444", light: "#F87171", dark: "#DC2626" },
        info: { DEFAULT: "#5D90C0", light: "#7FA7D1", dark: "#4A7AA3" },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        brand: "12px",
        button: "8px",
        input: "6px",
      },
      fontFamily: {
        sans: ["var(--font-handjet)", "Rubik", "system-ui", "sans-serif"],
        display: ["Rubik", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-primary": "linear-gradient(135deg, #5D90C0, #4A7AA3)",
        "gradient-secondary": "linear-gradient(135deg, #AFC7DA, #9ABACF)",
        "gradient-accent": "linear-gradient(135deg, #89C3AD, #71B3A1)",
        "gradient-brand": "linear-gradient(135deg, #5D90C0, #89C3AD)",
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        medium: "0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 25px -5px rgba(0, 0, 0, 0.04)",
        strong: "0 10px 40px -15px rgba(0, 0, 0, 0.2)",
        brand: "0 8px 32px -8px rgba(93, 144, 192, 0.2)",
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
