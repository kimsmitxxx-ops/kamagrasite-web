import type { Config } from "tailwindcss";

const withAlpha = (cssVar: string) => `rgb(var(${cssVar}) / <alpha-value>)`;

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: withAlpha("--color-background"),
        surface: withAlpha("--color-surface"),
        paper: {
          DEFAULT: withAlpha("--color-paper"),
          soft: withAlpha("--color-paper-soft"),
          ink: withAlpha("--color-paper-ink"),
          "ink-muted": withAlpha("--color-paper-ink-muted"),
          border: withAlpha("--color-paper-border"),
        },
        primary: {
          DEFAULT: withAlpha("--color-primary"),
          soft: withAlpha("--color-primary-soft"),
          muted: withAlpha("--color-primary-muted"),
          foreground: withAlpha("--color-primary-foreground"),
        },
        accent: {
          DEFAULT: withAlpha("--color-accent"),
          soft: withAlpha("--color-accent-soft"),
          muted: withAlpha("--color-accent-muted"),
          foreground: withAlpha("--color-accent-foreground"),
        },
        text: {
          DEFAULT: withAlpha("--color-text"),
          muted: withAlpha("--color-text-muted"),
          subtle: withAlpha("--color-text-subtle"),
        },
        foreground: withAlpha("--color-foreground"),
        border: withAlpha("--color-border"),
        "border-strong": withAlpha("--color-border-strong"),
        success: {
          DEFAULT: withAlpha("--color-success"),
          soft: withAlpha("--color-success-soft"),
        },
        danger: {
          DEFAULT: withAlpha("--color-danger"),
          soft: withAlpha("--color-danger-soft"),
        },
        warning: {
          DEFAULT: withAlpha("--color-warning"),
          soft: withAlpha("--color-warning-soft"),
        },
        info: {
          DEFAULT: withAlpha("--color-info"),
          soft: withAlpha("--color-info-soft"),
        },
        muted: {
          DEFAULT: withAlpha("--color-muted"),
          foreground: withAlpha("--color-muted-foreground"),
        },
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Manrope", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(17, 36, 30, 0.06), 0 2px 10px rgba(17, 36, 30, 0.06)",
        lift: "0 6px 18px rgba(17, 36, 30, 0.10), 0 16px 40px rgba(17, 36, 30, 0.08)",
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        md: "10px",
        lg: "12px",
      },
      spacing: {
        13: "3.25rem",
        18: "4.5rem",
        22: "5.5rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
