/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Work Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Bricolage Grotesque', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        '3xl': '1.75rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'xs':  '0 1px 2px rgba(15,23,42,0.04)',
        'soft': '0 1px 3px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.05)',
        'card': '0 2px 8px rgba(15,23,42,0.05), 0 12px 28px rgba(15,23,42,0.07)',
        'panel': '0 4px 16px rgba(15,23,42,0.06), 0 24px 56px rgba(15,23,42,0.09)',
        'float': '0 8px 32px rgba(15,23,42,0.07), 0 40px 80px rgba(15,23,42,0.10)',
        'glow-primary': '0 0 0 3px rgba(255,107,53,0.18)',
        'glow-secondary': '0 0 0 3px rgba(14,149,148,0.18)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '700': '700ms',
      },
      animation: {
        'fade-up':   'fade-up 0.35s ease both',
        'fade-in':   'fade-in 0.25s ease both',
        'shimmer':   'shimmer 1.5s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-sm': 'bounce-sm 1s ease-in-out infinite',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'bounce-sm': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
      },
      screens: {
        'xs': '480px',
      },
    },
  },
  plugins: [],
};
