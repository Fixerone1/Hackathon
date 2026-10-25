import type { Config } from 'tailwindcss';

const yellowScale = {
  50: '#FFFFFF',
  100: '#FFF8B8',
  200: '#FFF8B8',
  300: '#FFE500',
  400: '#FFE500',
  500: '#FFE500',
  600: '#FFE500',
  700: '#0A0A0A',
  800: '#0A0A0A',
  900: '#0A0A0A',
  950: '#0A0A0A',
};

const neutralScale = {
  50: '#FFFFFF',
  100: '#FFFFFF',
  200: '#FFF8B8',
  300: '#FFE500',
  400: '#0A0A0A',
  500: '#0A0A0A',
  600: '#0A0A0A',
  700: '#0A0A0A',
  800: '#0A0A0A',
  900: '#0A0A0A',
  950: '#0A0A0A',
};

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        slate: neutralScale,
        red: yellowScale,
        amber: yellowScale,
        blue: yellowScale,
        yellow: yellowScale,
        emerald: { ...yellowScale, DEFAULT: '#FFE500', light: '#FFF8B8', dark: '#0A0A0A' },
        white: '#FFFFFF',
        black: '#0A0A0A',
        sand: '#FFFFFF',
        surface: '#FFFFFF',
        sunshine: { DEFAULT: '#FFE500', light: '#FFF8B8', dark: '#0A0A0A' },
        ocean: '#0A0A0A',
        'ocean-deep': '#0A0A0A',
        terracotta: { DEFAULT: '#FFE500', action: '#0A0A0A', dark: '#0A0A0A' },
        sage: '#FFF8B8',
        midnight: '#0A0A0A',
        navy: '#0A0A0A',
        canvas: '#FFFFFF',
        ink: '#0A0A0A',
      },
      fontFamily: { sans: ['IBM Plex Sans', 'sans-serif'] },
      borderRadius: { card: '16px', '3xl': '16px' },
      boxShadow: { card: '0 8px 28px rgba(10,10,10,0.07), 0 1px 3px rgba(10,10,10,0.04)' },
    },
  },
  plugins: [],
};

export default config;
