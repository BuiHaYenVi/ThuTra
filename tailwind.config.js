/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#effbf7',
          100: '#d7f5eb',
          200: '#b1ebd8',
          300: '#7ddac1',
          400: '#46c1a5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        brand: {
          dark: '#046a4e',
          accent: '#10b981',
          light: '#effbf7',
          surface: '#f8fafc',
        }
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'subtle': '0 2px 8px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
