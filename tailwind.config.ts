import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        white: '#FDFBF7',
        sand: '#FDFBF7',
        ocean: '#0F2E35',
        'ocean-deep': '#09252B',
        terracotta: { DEFAULT: '#E05A36', action: '#B43D22', dark: '#96351F' },
        sage: '#E2ECE9',
        midnight: '#0F2E35',
        navy: '#09252B',
        emerald: { DEFAULT: '#E05A36', dark: '#A33B24', light: '#E2ECE9' },
        canvas: '#FDFBF7',
        ink: '#0F2E35',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: { card: '8px' },
      boxShadow: { card: '0 4px 12px rgba(0,0,0,0.08)' },
    },
  },
  plugins: [],
};

export default config;
