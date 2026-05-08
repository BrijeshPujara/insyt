import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background:      "rgb(var(--background) / <alpha-value>)",
        surface:         "rgb(var(--surface) / <alpha-value>)",
        "surface-dim":   "rgb(var(--surface-dim) / <alpha-value>)",
        "surface-bright":"rgb(var(--surface-bright) / <alpha-value>)",
        "surface-variant":"rgb(var(--surface-variant) / <alpha-value>)",
        "surface-tint":  "rgb(var(--surface-tint) / <alpha-value>)",
        "surface-container-lowest": "rgb(var(--surface-container-lowest) / <alpha-value>)",
        "surface-container-low":    "rgb(var(--surface-container-low) / <alpha-value>)",
        "surface-container":        "rgb(var(--surface-container) / <alpha-value>)",
        "surface-container-high":   "rgb(var(--surface-container-high) / <alpha-value>)",
        "surface-container-highest":"rgb(var(--surface-container-highest) / <alpha-value>)",

        "on-background":       "rgb(var(--on-background) / <alpha-value>)",
        "on-surface":          "rgb(var(--on-surface) / <alpha-value>)",
        "on-surface-variant":  "rgb(var(--on-surface-variant) / <alpha-value>)",

        primary:               "rgb(var(--primary) / <alpha-value>)",
        "on-primary":          "rgb(var(--on-primary) / <alpha-value>)",
        "primary-container":   "rgb(var(--primary-container) / <alpha-value>)",
        "on-primary-container":"rgb(var(--on-primary-container) / <alpha-value>)",
        "primary-fixed":       "rgb(var(--primary-fixed) / <alpha-value>)",
        "primary-fixed-dim":   "rgb(var(--primary-fixed-dim) / <alpha-value>)",
        "inverse-primary":     "rgb(var(--inverse-primary) / <alpha-value>)",

        secondary:              "rgb(var(--secondary) / <alpha-value>)",
        "on-secondary":         "rgb(var(--on-secondary) / <alpha-value>)",
        "secondary-container":  "rgb(var(--secondary-container) / <alpha-value>)",

        outline:         "rgb(var(--outline) / <alpha-value>)",
        "outline-variant":"rgb(var(--outline-variant) / <alpha-value>)",

        error:                "rgb(var(--error) / <alpha-value>)",
        "on-error":           "rgb(var(--on-error) / <alpha-value>)",
        "error-container":    "rgb(var(--error-container) / <alpha-value>)",
        "on-error-container": "rgb(var(--on-error-container) / <alpha-value>)",

        "inverse-surface":    "rgb(var(--inverse-surface) / <alpha-value>)",
        "inverse-on-surface": "rgb(var(--inverse-on-surface) / <alpha-value>)",

        // Semantic aliases (shadcn/ui compatible)
        foreground:            "rgb(var(--on-background) / <alpha-value>)",
        card:                  "rgb(var(--surface) / <alpha-value>)",
        "card-foreground":     "rgb(var(--on-surface) / <alpha-value>)",
        muted:                 "rgb(var(--muted) / <alpha-value>)",
        "muted-foreground":    "rgb(var(--on-surface-variant) / <alpha-value>)",
        border:                "rgb(var(--outline-variant) / <alpha-value>)",
        input:                 "rgb(var(--outline-variant) / <alpha-value>)",
        "primary-foreground":  "rgb(var(--on-primary) / <alpha-value>)",
        ring:                  "rgb(var(--primary) / <alpha-value>)",
      },
      fontFamily: {
        manrope: ["var(--font-manrope)", "Manrope", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        display:       ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        "body-lg":     ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md":     ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "label-md":    ["14px", { lineHeight: "1.4", letterSpacing: "0.01em", fontWeight: "500" }],
        "label-sm":    ["12px", { lineHeight: "1.2", fontWeight: "600" }],
      },
      spacing: {
        unit:                "8px",
        "stack-sm":          "8px",
        "stack-md":          "16px",
        "stack-lg":          "32px",
        gutter:              "24px",
        "container-padding": "32px",
        "section-gap":       "64px",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg:      "0.5rem",
        xl:      "0.75rem",
        "2xl":   "1rem",
        "3xl":   "1.5rem",
        full:    "9999px",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "0.4", transform: "scale(0.8)" },
          "50%":      { opacity: "1",   transform: "scale(1)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
        "ambient-drift": {
          "0%":   { transform: "translate(0px, 0px) scale(1)" },
          "33%":  { transform: "translate(28px, -18px) scale(1.07)" },
          "66%":  { transform: "translate(-14px, 22px) scale(0.96)" },
          "100%": { transform: "translate(8px, -10px) scale(1.03)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 18px var(--glow-primary)" },
          "50%":       { boxShadow: "0 0 32px var(--glow-primary), 0 0 56px var(--glow-primary)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%":      { transform: "translateY(-5px) rotate(0.4deg)" },
          "66%":      { transform: "translateY(-2px) rotate(-0.4deg)" },
        },
        "gradient-shift": {
          "0%":   { backgroundPosition: "0% 50%" },
          "50%":  { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.93)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(12px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        "orb-spin": {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "float-y": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-4px)" },
        },
        "counter-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in":       "fade-in 0.38s cubic-bezier(0.22,1,0.36,1) forwards",
        "pulse-dot":     "pulse-dot 1.4s ease-in-out infinite",
        shimmer:         "shimmer 1.6s ease-in-out infinite",
        "ambient-drift": "ambient-drift 20s ease-in-out infinite alternate",
        "glow-pulse":    "glow-pulse 3.2s ease-in-out infinite",
        float:           "float 6.5s ease-in-out infinite",
        "gradient-shift":"gradient-shift 4s ease infinite",
        "scale-in":      "scale-in 0.24s cubic-bezier(0.22,1,0.36,1) forwards",
        "slide-in-right":"slide-in-right 0.3s cubic-bezier(0.22,1,0.36,1) forwards",
        "orb-spin":      "orb-spin 2.4s linear infinite",
        "float-y":       "float-y 5s ease-in-out infinite",
        "counter-in":    "counter-in 0.6s cubic-bezier(0.22,1,0.36,1) forwards",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.22, 1, 0.36, 1)",
        smooth:  "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      backgroundSize: {
        "200%": "200% 200%",
      },
    },
  },
  plugins: [],
};

export default config;
