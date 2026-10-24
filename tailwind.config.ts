import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        white: '#FFFFFF',
        sand: '#F7F4E8',
        sunshine: { DEFAULT: '#F4C542', light: '#FFF3C4', dark: '#D6A514' },
        ocean: '#0F2E35',
        'ocean-deep': '#09252B',
        terracotta: { DEFAULT: '#E05A36', action: '#B43D22', dark: '#96351F' },
        sage: '#FFF3C4',
        midnight: '#0F2E35',
        navy: '#09252B',
        emerald: { DEFAULT: '#E05A36', dark: '#A33B24', light: '#E2ECE9' },
        canvas: '#F7F4E8',
        ink: '#0F2E35',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: { card: '12px' },
      boxShadow: { card: '0 2px 8px rgba(15,46,53,0.05), 0 1px 2px rgba(15,46,53,0.04)' },
    },
  },
  plugins: [],
};

export default config;
