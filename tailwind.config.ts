import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cairo: ["Cairo", "Tajawal", "sans-serif"],
        sans: ["Cairo", "Tajawal", "sans-serif"],
      },
      colors: {
        // Brand colors matching existing design system exactly
        primary: {
          DEFAULT: "#4F6BFF",
          dark: "#3B54E8",
          light: "#6B83FF",
          ultra: "#EEF1FF",
          50: "#F5F7FF",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#1E293B",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#F59E0B",
          light: "#FEF3C7",
          foreground: "#1E293B",
        },
        success: {
          DEFAULT: "#10B981",
          light: "#D1FAE5",
          foreground: "#ffffff",
        },
        danger: {
          DEFAULT: "#EF4444",
          light: "#FEE2E2",
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FEF3C7",
          foreground: "#1E293B",
        },
        wa: {
          DEFAULT: "#25D366",
          dark: "#1EA855",
        },
        // Grays matching design
        gray: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
        // Shadcn compatibility
        background: "#F8FAFC",
        foreground: "#1E293B",
        card: {
          DEFAULT: "#ffffff",
          foreground: "#1E293B",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#1E293B",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        border: "#E2E8F0",
        input: "#E2E8F0",
        ring: "#4F6BFF",
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#ffffff",
        },
        chart: {
          "1": "#4F6BFF",
          "2": "#10B981",
          "3": "#F59E0B",
          "4": "#EF4444",
          "5": "#8B5CF6",
        },
        sidebar: {
          DEFAULT: "#1E293B",
          foreground: "#ffffff",
          primary: "#4F6BFF",
          "primary-foreground": "#ffffff",
          accent: "rgba(255,255,255,0.08)",
          "accent-foreground": "#ffffff",
          border: "rgba(255,255,255,0.08)",
          ring: "#4F6BFF",
        },
      },
      borderRadius: {
        xs: "6px",
        sm: "10px",
        DEFAULT: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "40px",
        full: "9999px",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(0,0,0,.05)",
        sm: "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
        DEFAULT: "0 4px 16px rgba(0,0,0,.08)",
        md: "0 8px 32px rgba(0,0,0,.10)",
        lg: "0 20px 60px rgba(0,0,0,.12)",
        xl: "0 32px 80px rgba(0,0,0,.15)",
        primary: "0 8px 32px rgba(79,107,255,.25)",
        "primary-lg": "0 12px 40px rgba(79,107,255,.35)",
        wa: "0 8px 24px rgba(37,211,102,.30)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".4" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0)" },
          "60%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fadeUp 0.6s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
        shimmer: "shimmer 1.5s infinite",
        "pulse-dot": "pulse 1.5s infinite",
        "bounce-in": "bounce-in 0.6s ease",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
