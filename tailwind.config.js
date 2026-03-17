/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        baloo: ['"Baloo Da 2"', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'slide-up':  'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
        'fade-in':   'fadeIn 0.2s ease',
        'bounce-in': 'bounceIn 0.35s cubic-bezier(0.175,0.885,0.32,1.275)',
      },
      keyframes: {
        slideUp:  { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:   { from: { opacity: '0' }, to: { opacity: '1' } },
        bounceIn: { from: { opacity: '0', transform: 'scale(0.85)' }, to: { opacity: '1', transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
}
