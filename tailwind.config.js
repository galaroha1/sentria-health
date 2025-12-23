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
          50: '#F2F6FC',  // Very light blue/grey
          100: '#E1E9F7',
          200: '#C5D6F2',
          300: '#9ABBE8',
          400: '#6495DB',
          500: '#3D72CB', // Lighter accessible blue
          600: '#011F5B', // **Penn Blue** (Primary/Brand Anchor) - Moved to 600 for common button usage
          700: '#01194A',
          800: '#011F5B', // Keeping 800 as anchor for text/bgs
          900: '#001238',
          950: '#000A21',
        },
        secondary: {
          50: '#FEF2F2',
          100: '#FDE6E6',
          200: '#FBD0D0',
          300: '#F7AAB0',
          400: '#F27D87',
          500: '#E84E5D',
          600: '#D4263B',
          700: '#990000', // **Penn Red** (Brand Anchor)
          800: '#800000',
          900: '#6B0000',
          950: '#3D0000',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
