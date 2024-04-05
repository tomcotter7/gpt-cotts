/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
    colors: {
          'gray': {
              DEFAULT: '#64748b'
           },
          'black': '#000000',
          'tangerine': {
              DEFAULT: '#fcbe6a',
              dark: '#fa9712'
          },
          'skyblue': {
              DEFAULT: '#caf7f8',
              dark: '#5fe7ea'
          },
          'spearmint': {
              DEFAULT: '#96f4a2',
              dark: '#60ee72'
          },
          'red': {
              300: '#fca5a5',
              400: '#f87171',
          },
        'green': {
            400: '#4ade80',
        },
      }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
