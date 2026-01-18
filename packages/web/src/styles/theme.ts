/**
 * Theme configuration and design tokens
 * Modern, bright, minimalist design system with dark mode support
 */

// Light mode colors
export const lightColors = {
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  primaryLight: '#60A5FA',
  primaryGradient: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
  entrada: '#10B981',
  entradaHover: '#059669',
  entradaLight: '#D1FAE5',
  salida: '#F43F5E',
  salidaHover: '#E11D48',
  salidaLight: '#FFE4E6',
  almuerzo: '#F59E0B',
  almuerzoHover: '#D97706',
  almuerzoLight: '#FEF3C7',
  purple: '#8B5CF6',
  pink: '#EC4899',
  orange: '#F97316',
  teal: '#14B8A6',
  cyan: '#06B6D4',
  white: '#FFFFFF',
  black: '#09090B',
  gray50: '#FAFAFA',
  gray100: '#F4F4F5',
  gray200: '#E4E4E7',
  gray300: '#D4D4D8',
  gray400: '#A1A1AA',
  gray500: '#71717A',
  gray600: '#52525B',
  gray700: '#3F3F46',
  gray800: '#27272A',
  gray900: '#18181B',
  success: '#10B981',
  error: '#F43F5E',
  warning: '#F59E0B',
  info: '#3B82F6',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceHover: '#F4F4F5',
  text: '#18181B',
  textSecondary: '#52525B',
  border: '#E4E4E7',
} as const;

// Dark mode colors
export const darkColors = {
  primary: '#60A5FA',
  primaryDark: '#3B82F6',
  primaryLight: '#93C5FD',
  primaryGradient: 'linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%)',
  entrada: '#34D399',
  entradaHover: '#10B981',
  entradaLight: '#064E3B',
  salida: '#FB7185',
  salidaHover: '#F43F5E',
  salidaLight: '#4C0519',
  almuerzo: '#FBBF24',
  almuerzoHover: '#F59E0B',
  almuerzoLight: '#451A03',
  purple: '#A78BFA',
  pink: '#F472B6',
  orange: '#FB923C',
  teal: '#2DD4BF',
  cyan: '#22D3EE',
  white: '#09090B',
  black: '#FFFFFF',
  gray50: '#18181B',
  gray100: '#27272A',
  gray200: '#3F3F46',
  gray300: '#52525B',
  gray400: '#71717A',
  gray500: '#A1A1AA',
  gray600: '#D4D4D8',
  gray700: '#E4E4E7',
  gray800: '#F4F4F5',
  gray900: '#FAFAFA',
  success: '#34D399',
  error: '#FB7185',
  warning: '#FBBF24',
  info: '#60A5FA',
  background: '#09090B',
  surface: '#18181B',
  surfaceHover: '#27272A',
  text: '#FAFAFA',
  textSecondary: '#A1A1AA',
  border: '#3F3F46',
} as const;

export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
  display: 56,
} as const;

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export const fonts = {
  heading: 'Montserrat, sans-serif',
  body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
  },
} as const;

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export const getThemeColors = (isDark: boolean) => isDark ? darkColors : lightColors;

export const theme = {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  fonts,
  shadows,
  breakpoints,
} as const;

export type Theme = typeof theme;
export type ThemeColors = typeof lightColors;
