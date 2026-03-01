import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        military: {
          dark: "#0a0e27",
          light: "#1a1f3a",
          olive: "#556b2f",
          green: "#6b8e23",
          red: "#dc2626",
          gold: "#eab308",
          gray: "#374151",
        },
      },
      backgroundColor: {
        "primary-dark": "#0a0e27",
        "secondary-dark": "#1a1f3a",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};

export default config;
