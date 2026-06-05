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
        gold: "#D4AF37",
        terracotta: "#C97B4A",
        stone: "#1A1A1A",
        bone: "#F5F5DC",
        "bone-dark": "#E8E4D0",
        "lamborghini-gold": "#FFC000",
        "dark-gold": "#917300",
        charcoal: "#202020",
        "dark-iron": "#181818",
        ash: "#7D7D7D",
        "cyan-pulse": "#29ABE2",
        "link-blue": "#3860BE",
      },
      fontFamily: {
        heading: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      height: {
        "screen-safe": "100dvh",
      },
      minHeight: {
        "screen-safe": "100dvh",
      },
    },
  },
  plugins: [],
};
export default config;
