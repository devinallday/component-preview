/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: '#1db954',
          black: '#191414',
          gray: {
            100: '#f6f6f6',
            200: '#e0e0e0',
            300: '#b3b3b3',
            400: '#888888',
            500: '#535353',
            600: '#404040',
            700: '#2a2a2a',
            800: '#1a1a1a',
            900: '#121212',
          }
        }
      },
      fontFamily: {
        'spotify': ['Circular', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'in': 'animateIn 200ms ease-out',
        'fade-in-0': 'fadeIn 200ms ease-out',
        'zoom-in-95': 'zoomIn 200ms ease-out',
        'slide-in-from-top-2': 'slideInFromTop 200ms ease-out',
      },
      keyframes: {
        animateIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        zoomIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        slideInFromTop: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} 