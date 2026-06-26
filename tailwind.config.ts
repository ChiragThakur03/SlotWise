import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        page: "1200px",
      },
      colors: {
        navy: "#0D1B2A",
        teal: {
          DEFAULT: "#00C2A8",
          mid: "#019587",
          light: "#E1F5EE",
        },
        "off-white": "#F4F7F9",
        gold: "#F5A623",

        background: "#F4F7F9",
        foreground: "#0D1B2A",

        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0D1B2A",
          border: "#E0EAF0",
        },

        border: "#E0EAF0",
        input: "#D0DCE8",
        "input-placeholder": "#A0B4C2",
        ring: "#00C2A8",

        primary: {
          DEFAULT: "#00C2A8",
          foreground: "#0D1B2A",
          hover: "#019587",
        },
        secondary: {
          DEFAULT: "transparent",
          foreground: "#019587",
        },
        muted: {
          DEFAULT: "#EEF2F6",
          foreground: "#5B6B7A",
        },
        accent: {
          DEFAULT: "#E1F5EE",
          foreground: "#0F6E56",
        },
        destructive: {
          DEFAULT: "#E8474B",
          foreground: "#FFFFFF",
        },
      },
      borderRadius: {
        btn: "8px",
        card: "12px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(0,0,0,0.08)",
        none: "none",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
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
        "confetti-fall": {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(110vh) rotate(360deg)", opacity: "0.4" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "confetti-fall": "confetti-fall linear forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
