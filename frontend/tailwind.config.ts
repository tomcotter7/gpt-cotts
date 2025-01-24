import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        gray: {
          DEFAULT: '#64748b',
        },
        tangerine: {
          DEFAULT: '#fcbe6a',
          dark: '#ecb66d',
          light: '#fcc67d'
        },
        skyblue: {
          DEFAULT: '#caf7f8',
          dark: '#c1e8e9',
          light: '#d1f8f9'
        },
        spearmint: {
          DEFAULT: "#96f4a2"
        },
        red: {
          300: '#fca5a5',
          400: '#f87171',
          500: '#f44336',
          700: '#d32f2f',
          900: '#b71c1c'
        },
        green: {
          400: '#4ade80'
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ]
};
export default config;
