/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        baloo: ['"Baloo Da 2"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
      },
      animation: {
        'slide-up':   'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
        'fade-in':    'fadeIn 0.2s ease',
        'bounce-in':  'bounceIn 0.35s cubic-bezier(0.175,0.885,0.32,1.275)',
        'press':      'press 0.1s ease',
      },
      keyframes: {
        slideUp:   { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        bounceIn:  { from: { opacity: 0, transform: 'scale(0.85)' }, to: { opacity: 1, transform: 'scale(1)' } },
        press:     { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(0.93)' } },
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
}
