import type { Config } from 'tailwindcss';

const yellowScale = {
  50: '#FFFCF1',
  100: '#FFF6D8',
  200: '#FDEBB0',
  300: '#F9DD83',
  400: '#F4C84A',
  500: '#E8B52E',
  600: '#C99720',
  700: '#9F751B',
  800: '#795A1D',
  900: '#644B1D',
  950: '#39290D',
};

const neutralScale = {
  50: '#F8FAFC',
  100: '#F1F5F8',
  200: '#E2E8EE',
  300: '#CBD4DD',
  400: '#94A1AE',
  500: '#647282',
  600: '#4D5B69',
  700: '#384552',
  800: '#27333F',
  900: '#1A2530',
  950: '#101820',
};

const redScale = {
  50: '#FEF2F2',
  100: '#FEE2E2',
  200: '#FECACA',
  300: '#FCA5A5',
  400: '#F87171',
  500: '#EF4444',
  600: '#DC2626',
  700: '#B91C1C',
  800: '#991B1B',
  900: '#7F1D1D',
  950: '#450A0A',
};

const amberScale = {
  50: '#FFFBEB',
  100: '#FEF3C7',
  200: '#FDE68A',
  300: '#FCD34D',
  400: '#FBBF24',
  500: '#F59E0B',
  600: '#D97706',
  700: '#B45309',
  800: '#92400E',
  900: '#78350F',
  950: '#451A03',
};

const blueScale = {
  50: '#EFF6FF',
  100: '#DBEAFE',
  200: '#BFDBFE',
  300: '#93C5FD',
  400: '#60A5FA',
  500: '#3B82F6',
  600: '#2563EB',
  700: '#1D4ED8',
  800: '#1E40AF',
  900: '#1E3A8A',
  950: '#172554',
};

const emeraldScale = {
  50: '#EFF7F1',
  100: '#DFEEE3',
  200: '#C2DEC9',
  300: '#95C5A3',
  400: '#64A77B',
  500: '#43885F',
  600: '#34704D',
  700: '#2C593F',
  800: '#254834',
  900: '#203B2D',
  950: '#102119',
};

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        slate: neutralScale,
        red: redScale,
        amber: amberScale,
        blue: blueScale,
        yellow: yellowScale,
        emerald: { ...emeraldScale, DEFAULT: '#43885F', light: '#DFEEE3', dark: '#254834' },
        white: '#FFFFFF',
        black: '#1F2933',
        sand: '#F7F6F1',
        surface: '#FFFFFF',
        sunshine: { DEFAULT: '#F4C84A', light: '#FFF6D8', dark: '#795E12' },
        ocean: '#416E69',
        'ocean-deep': '#294B48',
        terracotta: { DEFAULT: '#B96D52', action: '#315D49', dark: '#8E4F3C' },
        sage: '#EAF1E8',
        midnight: '#1F2933',
        navy: '#273A4A',
        canvas: '#F7F8FA',
        ink: '#26323D',
      },
      fontFamily: { sans: ['IBM Plex Sans', 'sans-serif'] },
      borderRadius: { card: '16px', '3xl': '16px' },
      boxShadow: { card: '0 8px 28px rgba(10,10,10,0.07), 0 1px 3px rgba(10,10,10,0.04)' },
    },
  },
  plugins: [],
};

export default config;
