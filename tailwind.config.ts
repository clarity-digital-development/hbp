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
        black: "rgb(var(--rgb-black) / <alpha-value>)",
        charcoal: "rgb(var(--rgb-charcoal) / <alpha-value>)",
        "dark-gray": "rgb(var(--rgb-dark-gray) / <alpha-value>)",
        "medium-gray": "rgb(var(--rgb-medium-gray) / <alpha-value>)",
        "light-gray": "rgb(var(--rgb-light-gray) / <alpha-value>)",
        "off-white": "rgb(var(--rgb-off-white) / <alpha-value>)",
        white: "rgb(var(--rgb-white) / <alpha-value>)",
        // Neutral supports
        cream: "rgb(var(--rgb-cream) / <alpha-value>)",
        beige: "rgb(var(--rgb-beige) / <alpha-value>)",
        mist: "rgb(var(--rgb-mist) / <alpha-value>)",
        // Brand — olive
        olive: "rgb(var(--rgb-olive) / <alpha-value>)",
        "olive-dark": "rgb(var(--rgb-olive-dark) / <alpha-value>)",
        "olive-tint": "rgb(var(--rgb-olive-tint) / <alpha-value>)",
        // Warm browns
        "light-brown": "rgb(var(--rgb-light-brown) / <alpha-value>)",
        tan: "rgb(var(--rgb-tan) / <alpha-value>)",
        // Gold accent
        gold: "rgb(var(--rgb-gold) / <alpha-value>)",
        "gold-dark": "rgb(var(--rgb-gold-dark) / <alpha-value>)",
        // Accent Colors
        "blush-light": "rgb(var(--rgb-blush-light) / <alpha-value>)",
        blush: "rgb(var(--rgb-blush) / <alpha-value>)",
        "dusty-rose": "rgb(var(--rgb-dusty-rose) / <alpha-value>)",
        mauve: "rgb(var(--rgb-mauve) / <alpha-value>)",
        // Brand
        sage: "rgb(var(--rgb-sage) / <alpha-value>)",
        "sage-dark": "rgb(var(--rgb-sage-dark) / <alpha-value>)",
        "sage-deep": "rgb(var(--rgb-sage-deep) / <alpha-value>)",
        // Functional
        success: "rgb(var(--rgb-success) / <alpha-value>)",
        warning: "rgb(var(--rgb-warning) / <alpha-value>)",
        error: "rgb(var(--rgb-error) / <alpha-value>)",
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
