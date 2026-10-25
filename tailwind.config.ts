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
        sunshine: { DEFAULT: '#FFE500', light: '#FFF8B8', dark: '#806E00' },
        ocean: '#0A0A0A',
        'ocean-deep': '#0A0A0A',
        terracotta: { DEFAULT: '#4B5563', action: '#0A0A0A', dark: '#111827' },
        sage: '#FFF8B8',
        midnight: '#0A0A0A',
        navy: '#111827',
        emerald: {
          DEFAULT: '#FFE500', light: '#FFF8B8', dark: '#806E00',
          50: '#FFFDF0', 100: '#FFF8B8', 200: '#FFF08A', 300: '#FFE500', 400: '#E6CF00',
          500: '#BFAE00', 600: '#998B00', 700: '#806E00', 800: '#5C4B00', 900: '#3D3300',
        },
        canvas: '#F8FAFC',
        ink: '#111827',
        amber: { 50: '#FFFDF0', 100: '#FFF8B8', 200: '#FFF08A', 300: '#FFE500', 800: '#5C4B00', 900: '#3D3300' },
      },
      fontFamily: { sans: ['IBM Plex Sans', 'sans-serif'] },
      borderRadius: { card: '16px', '3xl': '16px' },
      boxShadow: { card: '0 8px 28px rgba(10,10,10,0.07), 0 1px 3px rgba(10,10,10,0.04)' },
    },
  },
  plugins: [],
};

export default config;
