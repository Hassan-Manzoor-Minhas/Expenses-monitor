/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#ced9fd',
          300: '#a3b8fc',
          400: '#728ff8',
          500: '#4f6bf2',
          600: '#384ee4',
          700: '#2c3bc8',
          800: '#2633a1',
          900: '#242f7f',
          950: '#141846',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 25px -5px rgba(79, 107, 242, 0.3)',
        'glow-success': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'glow-danger': '0 0 25px -5px rgba(244, 63, 94, 0.3)',
      },
    },
  },
  plugins: [],
};
