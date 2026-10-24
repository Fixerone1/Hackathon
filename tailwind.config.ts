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
        ocean: '#222222',
        'ocean-deep': '#111111',
        terracotta: { DEFAULT: '#666666', action: '#333333', dark: '#222222' },
        sage: '#FFF8B8',
        midnight: '#222222',
        navy: '#111111',
        emerald: { DEFAULT: '#E5E5E5', dark: '#333333', light: '#F2F2F2' },
        canvas: '#FFFFFF',
        ink: '#222222',
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
