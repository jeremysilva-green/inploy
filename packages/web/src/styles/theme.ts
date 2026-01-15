/**
 * Theme configuration and design tokens
 * Modern, bright, minimalist design system
 */

export const colors = {
  // Primary brand colors - Vibrant blue
  primary: '#3B82F6', // Bright Blue
  primaryDark: '#2563EB',
  primaryLight: '#60A5FA',
  primaryGradient: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',

  // Check-in button states - Bright and bold
  entrada: '#10B981', // Emerald Green
  entradaHover: '#059669',
  entradaLight: '#D1FAE5',
  salida: '#F43F5E', // Rose Red
  salidaHover: '#E11D48',
  salidaLight: '#FFE4E6',
  almuerzo: '#F59E0B', // Amber
  almuerzoHover: '#D97706',
  almuerzoLight: '#FEF3C7',

  // Accent colors - Bright palette
  purple: '#8B5CF6',
  pink: '#EC4899',
  orange: '#F97316',
  teal: '#14B8A6',
  cyan: '#06B6D4',

  // Neutral colors - Clean whites and grays
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

  // Status colors
  success: '#10B981',
  error: '#F43F5E',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Background - Very light and airy
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceHover: '#F4F4F5',
} as const;

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
