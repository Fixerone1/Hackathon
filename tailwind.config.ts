import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#0D1B2A',
        navy: '#1B263B',
        emerald: { DEFAULT: '#10B981', dark: '#047857', light: '#D1FAE5' },
        canvas: '#F8FAFC',
        ink: '#111827',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: { card: '16px' },
      boxShadow: { card: '0 4px 12px rgba(0,0,0,0.08)' },
    },
  },
  plugins: [],
};

export default config;
