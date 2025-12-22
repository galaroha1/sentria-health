/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#c2d6ff',
          300: '#94b8ff',
          400: '#5c90ff',
          500: '#2e66ff',
          600: '#0044cc',
          700: '#013399',
          800: '#011f5b', // Penn Medicine Blue (Main)
          900: '#011a4d',
          950: '#000e33',
        },
        secondary: {
          50: '#fff0f0',
          100: '#ffe0e0',
          200: '#ffc2c2',
          300: '#ff9494',
          400: '#ff5c5c',
          500: '#ff2e2e',
          600: '#cc0000',
          700: '#990000', // Penn Medicine Red (Accent)
          800: '#800000',
          900: '#660000',
          950: '#400000',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
