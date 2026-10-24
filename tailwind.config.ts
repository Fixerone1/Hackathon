import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        white: '#FFFFFF',
        sand: '#F5F4EF',
        surface: '#F5F4EF',
        sunshine: { DEFAULT: '#FFE500', light: '#FFF8B8', dark: '#A68F00' },
        ocean: '#242724',
        'ocean-deep': '#171A18',
        terracotta: { DEFAULT: '#E05A36', action: '#B43D22', dark: '#96351F' },
        sage: '#FFF8B8',
        midnight: '#242724',
        navy: '#171A18',
        emerald: { DEFAULT: '#E05A36', dark: '#A33B24', light: '#E2ECE9' },
        canvas: '#FFFFFF',
        ink: '#242724',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: { card: '12px' },
      boxShadow: { card: '0 4px 18px rgba(31,34,30,0.06), 0 1px 3px rgba(31,34,30,0.04)' },
    },
  },
  plugins: [],
};

export default config;
