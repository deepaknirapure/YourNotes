/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tera signature brand color
        brand: {
          DEFAULT: '#E55B2D',
          dark: '#d14e24',
          light: 'rgba(229, 91, 45, 0.1)',
        },
        dark: {
          bg: '#0a0a0a',
          card: '#111111',
          border: 'rgba(255, 255, 255, 0.08)',
        }
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      // 3D Perspective for Flashcards
      perspective: {
        '1000': '1000px',
      }
    },
  },
  plugins: [
    // Flashcard flip ke liye helper plugin
    function ({ addUtilities }) {
      addUtilities({
        '.perspective-1000': {
          perspective: '1000px',
        },
        '.transform-style-3d': {
          'transform-style': 'preserve-3d',
        },
        '.backface-hidden': {
          'backface-visibility': 'hidden',
        },
        '.rotate-y-180': {
          transform: 'rotateY(180deg)',
        },
      })
    },
  ],
}