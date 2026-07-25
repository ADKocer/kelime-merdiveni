import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ladder: {
          bg: "var(--ladder-bg)",
          surface: "var(--ladder-surface)",
          border: "var(--ladder-border)",
          accent: "var(--ladder-accent)",
          success: "var(--ladder-success)",
          orange: "var(--ladder-orange)",
          text: "var(--ladder-text)",
          muted: "var(--ladder-muted)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

