/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf8f0',
          100: '#f9eddb',
          200: '#f2d7b3',
          300: '#e9bb82',
          400: '#df9a50',
          500: '#d6802e',
          600: '#c76924',
          700: '#a5511f',
          800: '#854220',
          900: '#6c381d',
          950: '#3a1b0d',
        },
        sage: {
          50: '#f4f7f4',
          100: '#e4ebe3',
          200: '#c9d7c8',
          300: '#a3bba1',
          400: '#789b76',
          500: '#577d55',
          600: '#436441',
          700: '#365036',
          800: '#2d412d',
          900: '#253626',
          950: '#121d13',
        },
        cream: {
          50: '#fefdfb',
          100: '#fcf8f0',
          200: '#f8f0de',
          300: '#f2e3c5',
          400: '#ebd1a4',
          500: '#e2bb7f',
        },
        rose: {
          50: '#fef5f5',
          100: '#fde8e8',
          200: '#fcd5d5',
          300: '#f9b3b3',
          400: '#f48585',
          500: '#ea5c5c',
        },
        sky: {
          50: '#f0f7fe',
          100: '#deedfc',
          200: '#c5e0fa',
          300: '#9dcdf6',
          400: '#6eb3ef',
          500: '#4b96e9',
        },
      },
      fontFamily: {
        sans: ['Rubik', 'system-ui', 'sans-serif'],
        display: ['Heebo', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
