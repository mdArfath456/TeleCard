/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: '#05060a',
          900: '#0a0c14',
          850: '#0e1120',
          800: '#12162a',
        },
        brand: {
          400: '#8b7bff',
          500: '#7c5cff',
          600: '#6a3ffb',
          700: '#5a2fe0',
        },
        accent: {
          400: '#22e6c5',
          500: '#0fd9b6',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Clash Display"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 60px -15px rgba(124, 92, 255, 0.55)',
        'glow-sm': '0 0 25px -8px rgba(124, 92, 255, 0.5)',
        card: '0 20px 60px -20px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'grid-lines':
          'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
        'radial-fade': 'radial-gradient(circle at top, rgba(124,92,255,0.18), transparent 60%)',
      },
      backgroundSize: {
        grid: '40px 40px',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: 0.8 },
          '80%, 100%': { transform: 'scale(1.6)', opacity: 0 },
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.215,0.61,0.355,1) infinite',
      },
    },
  },
  plugins: [],
};
