/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./providers/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand palette — matches web
        teal: { DEFAULT: "#46e4ee", dark: "#2bc8d4" },
        surface: { DEFAULT: "#0e1011", muted: "#161a1d" },
        border: { DEFAULT: "rgba(255,255,255,0.06)" },
      },
    },
  },
  plugins: [],
};
