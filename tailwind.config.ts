import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand primary colors
        primary: {
          DEFAULT: '#5D90C0',
          light: '#7FA7D1',
          dark: '#4A7AA3',
          50: '#F0F6FC',
          100: '#E1EDF9',
          200: '#C4DBF3',
          300: '#A7C8ED',
          400: '#8AB6E7',
          500: '#5D90C0',
          600: '#4A7AA3',
          700: '#3A6085',
          800: '#2A4768',
          900: '#1A2F4A'
        },
        // Brand secondary colors
        secondary: {
          DEFAULT: '#AFC7DA',
          light: '#C4D4E5',
          dark: '#9ABACF',
          50: '#F7FAFB',
          100: '#EFF5F8',
          200: '#DFEBF1',
          300: '#CFE0EA',
          400: '#BFD6E3',
          500: '#AFC7DA',
          600: '#9ABACF',
          700: '#85ADC4',
          800: '#6F9FB9',
          900: '#5A92AE'
        },
        // Brand accent colors
        accent: {
          DEFAULT: '#89C3AD',
          light: '#A1CDB9',
          dark: '#71B3A1',
          50: '#F4FBF8',
          100: '#E9F7F1',
          200: '#D3EFE3',
          300: '#BDE7D5',
          400: '#A7DFC7',
          500: '#89C3AD',
          600: '#71B3A1',
          700: '#5AA295',
          800: '#429289',
          900: '#2B817D'
        },
        // Brand background colors
        bg: {
          DEFAULT: '#D4E2EC',
          light: '#E1EBF3',
          dark: '#C7D9E5',
          primary: '#D4E2EC',
          secondary: '#EAF1F6',
          tertiary: '#F5F8FA'
        },
        // Brand muted colors
        muted: {
          DEFAULT: '#8DA4B1',
          light: '#A3B6C1',
          dark: '#7792A1',
          50: '#F6F8FA',
          100: '#EDF1F4',
          200: '#DBE3E9',
          300: '#C9D5DE',
          400: '#B7C7D3',
          500: '#8DA4B1',
          600: '#7792A1',
          700: '#618091',
          800: '#4B6E81',
          900: '#355C71'
        },
        // Text colors for different contexts
        on: {
          primary: '#F9FAFB',
          light: '#1E1E1E',
          dark: '#F9FAFB',
          muted: '#6B7280'
        },
        // Semantic colors
        success: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669'
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706'
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#F87171',
          dark: '#DC2626'
        },
        info: {
          DEFAULT: '#5D90C0',
          light: '#7FA7D1',
          dark: '#4A7AA3'
        }
      },
      // Typography
      fontFamily: {
        'sans': ['Rubik', 'system-ui', 'sans-serif'],
        'display': ['Rubik', 'system-ui', 'sans-serif']
      },
      // Brand gradients
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-primary": "linear-gradient(135deg, #5D90C0, #4A7AA3)",
        "gradient-secondary": "linear-gradient(135deg, #AFC7DA, #9ABACF)",
        "gradient-accent": "linear-gradient(135deg, #89C3AD, #71B3A1)",
        "gradient-brand": "linear-gradient(135deg, #5D90C0, #89C3AD)"
      },
      // Enhanced shadows with brand colors
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 25px -5px rgba(0, 0, 0, 0.04)',
        'strong': '0 10px 40px -15px rgba(0, 0, 0, 0.2)',
        'primary': '0 4px 25px -5px rgba(93, 144, 192, 0.3)',
        'secondary': '0 4px 25px -5px rgba(175, 199, 218, 0.3)',
        'accent': '0 4px 25px -5px rgba(137, 195, 173, 0.3)',
        'brand': '0 8px 32px -8px rgba(93, 144, 192, 0.2)',
        'glow-primary': '0 0 20px rgba(93, 144, 192, 0.3)',
        'glow-accent': '0 0 20px rgba(137, 195, 173, 0.3)'
      },
      // Brand spacing and sizing
      borderRadius: {
        'brand': '12px',
        'button': '8px',
        'input': '6px'
      },
      // Animation timing
      transitionDuration: {
        'brand': '200ms'
      },
      // Custom spacing for brand consistency
      spacing: {
        '18': '4.5rem',
        '88': '22rem'
      }
    },
  },
  plugins: [],
};

export default config;
