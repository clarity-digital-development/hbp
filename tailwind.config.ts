import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Neutrals
        black: "var(--color-black)",
        charcoal: "var(--color-charcoal)",
        "dark-gray": "var(--color-dark-gray)",
        "medium-gray": "var(--color-medium-gray)",
        "light-gray": "var(--color-light-gray)",
        "off-white": "var(--color-off-white)",
        white: "var(--color-white)",
        // Neutral supports
        cream: "var(--color-cream)",
        beige: "var(--color-beige)",
        mist: "var(--color-mist)",
        // Brand — olive
        olive: "var(--color-olive)",
        "olive-dark": "var(--color-olive-dark)",
        "olive-tint": "var(--color-olive-tint)",
        // Gold accent
        gold: "var(--color-gold)",
        "gold-dark": "var(--color-gold-dark)",
        // Accent Colors
        "blush-light": "var(--color-blush-light)",
        blush: "var(--color-blush)",
        "dusty-rose": "var(--color-dusty-rose)",
        mauve: "var(--color-mauve)",
        // Brand
        sage: "var(--color-sage)",
        "sage-dark": "var(--color-sage-dark)",
        "sage-deep": "var(--color-sage-deep)",
        // Functional
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        accent: ["var(--font-accent)"],
        script: ["var(--font-script)"],
        title: ["var(--font-title)", "Georgia", "serif"],
        flourish: ["var(--font-flourish)", "cursive"],
        reading: ["var(--font-reading)", "Georgia", "serif"],
      },
      fontSize: {
        "hero": ["6rem", { lineHeight: "1.1" }],
        "5xl": ["3.5rem", { lineHeight: "1.1" }],
        "4xl": ["2.5rem", { lineHeight: "1.2" }],
        "3xl": ["2rem", { lineHeight: "1.3" }],
        "2xl": ["1.5rem", { lineHeight: "1.4" }],
      },
    },
  },
  plugins: [],
};
export default config;
