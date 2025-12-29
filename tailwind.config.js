/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#f5f5f5',
          dark: '#171717',
        },
        border: {
          DEFAULT: '#e5e5e5',
          dark: '#262626',
        },
        muted: {
          DEFAULT: '#737373',
          dark: '#a3a3a3',
        },
      },
      letterSpacing: {
        wide: '0.05em',
        wider: '0.1em',
        widest: '0.2em',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
