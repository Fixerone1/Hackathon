import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        white: '#FFFFFF',
        black: '#0A0A0A',
        sand: '#F8FAFC',
        surface: '#FFFFFF',
        sunshine: { DEFAULT: '#10B981', light: '#D1FAE5', dark: '#047857' },
        ocean: '#0A0A0A',
        'ocean-deep': '#0A0A0A',
        terracotta: { DEFAULT: '#4B5563', action: '#0A0A0A', dark: '#111827' },
        sage: '#D1FAE5',
        midnight: '#0A0A0A',
        navy: '#111827',
        emerald: { DEFAULT: '#10B981', dark: '#047857', light: '#D1FAE5' },
        canvas: '#F8FAFC',
        ink: '#111827',
        amber: { 50: '#ECFDF5', 100: '#D1FAE5', 200: '#A7F3D0', 300: '#6EE7B7', 800: '#065F46', 900: '#064E3B' },
      },
      fontFamily: { sans: ['IBM Plex Sans', 'sans-serif'] },
      borderRadius: { card: '16px', '3xl': '16px' },
      boxShadow: { card: '0 8px 28px rgba(10,10,10,0.07), 0 1px 3px rgba(10,10,10,0.04)' },
    },
  },
  plugins: [],
};

export default config;
