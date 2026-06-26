import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        acorn: {
          50: "#fdf8f3",
          100: "#f9ede0",
          200: "#f2d9bd",
          300: "#e9be8f",
          400: "#de9d5e",
          500: "#d4833d",
          600: "#c66d32",
          700: "#a5552b",
          800: "#854529",
          900: "#6c3a24",
          950: "#3a1c11",
        },
        forest: {
          50: "#f3faf3",
          100: "#e3f5e3",
          200: "#c8eac9",
          300: "#9dd89f",
          400: "#6abe6d",
          500: "#45a349",
          600: "#348538",
          700: "#2c692f",
          800: "#275429",
          900: "#224524",
          950: "#0e2510",
        },
      },
    },
  },
  plugins: [],
};

export default config;
