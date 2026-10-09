/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        srkr: {
          navy: {
            900: '#071326',
            800: '#0B192C',
            700: '#14274E',
            600: '#1E3E62',
          },
          blue: {
            50: '#F0F7FF',
            100: '#E0EFFF',
            200: '#B9DDFF',
            500: '#005691',
            600: '#004370',
            700: '#003152',
          },
          accent: {
            orange: '#FF6500',
            gold: '#D97706',
            teal: '#0D9488',
          },
          surface: {
            50: '#F8FAFC',
            100: '#F1F5F9',
            200: '#E2E8F0',
            300: '#CBD5E1',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
