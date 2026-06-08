/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        brand: {
          50: '#EEF2F7',
          100: '#D4DEEC',
          200: '#A9BDD9',
          300: '#7E9CC6',
          400: '#537BB3',
          500: '#1E3A5F',
          600: '#1A3254',
          700: '#152A47',
          800: '#11213A',
          900: '#0C192D',
        },
        gold: {
          50: '#FBF6E8',
          100: '#F5EAC5',
          200: '#EDDCA0',
          300: '#E5CE7B',
          400: '#D4A843',
          500: '#C49A3A',
          600: '#A47E2E',
          700: '#846323',
          800: '#644918',
          900: '#44300E',
        },
        success: '#2D9B5A',
        danger: '#D94452',
        warning: '#E5A118',
        surface: '#F5F6FA',
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '"Source Han Sans SC"', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
