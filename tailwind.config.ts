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
        // Warm Neutrals
        cream: "var(--color-cream)",
        beige: "var(--color-beige)",
        "warm-beige": "var(--color-warm-beige)",
        taupe: "var(--color-taupe)",
        // Accent Colors
        "blush-light": "var(--color-blush-light)",
        blush: "var(--color-blush)",
        "dusty-rose": "var(--color-dusty-rose)",
        mauve: "var(--color-mauve)",
        // Brand
        "wood-brown": "var(--color-wood-brown)",
        tan: "var(--color-tan)",
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
