/**
 * MENYESHA design tokens.
 * Brand: blue, white, and red for a strong emergency-focused UI.
 * Fraunces (serif) carries numbers and headings; Manrope carries everything else.
 */

import type { CategoryId } from '@/types';

export const lightColors = {
  // Brand — deep blue with red emphasis
  brand: '#0B3C8D',
  brandForeground: '#0B3C8D',
  brandDark: '#082C62',
  brandDeep: '#061F4A',
  brandSoft: '#EAF1FF',
  accent: '#D62828',
  accentBright: '#EF4444',
  accentSoft: '#FEE2E2',

  // Legacy gold is replaced by red accents for the requested palette
  gold: '#D62828',
  goldBright: '#EF4444',
  goldSoft: '#FEE2E2',

  // Surfaces
  background: '#F8FAFC',
  surface: '#FFFFFF',
  sage: '#F1F5F9',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',

  // Text
  text: '#0F172A',
  textMuted: '#475569',
  textFaint: '#94A3B8',
  textOnBrand: '#FFFFFF',

  // Status
  success: '#0F766E',
  successSoft: '#CCFBF1',
  ochre: '#B45309',
  ochreSoft: '#FEF3C7',
  tealSoft: '#DBEAFE',
  neutral: '#64748B33',
  neutralText: '#64748B',
  neutralSoft: '#F1F5F9',

  // Emergency
  emergency: '#C62828',
  emergencyForeground: '#C62828',
  emergencySoft: '#FEE2E2',

  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(11, 60, 141, 0.55)',

  // Category colors
  category: {
    crime: { fg: '#B91C1C', bg: '#FEE2E2' },
    suspicious: { fg: '#D97706', bg: '#FEF3C7' },
    vandalism: { fg: '#7C3AED', bg: '#EDE9FE' },
    public_property: { fg: '#0A1F44', bg: '#E8EDF7' },
    traffic: { fg: '#1A56DB', bg: '#DBEAFE' },
    other: { fg: '#475569', bg: '#F1F5F9' },
  } satisfies Record<CategoryId, { fg: string; bg: string }>,
};

export const darkColors: typeof lightColors = {
  brand: '#4F9CF9',
  brandForeground: '#D9EBFF',
  brandDark: '#2D6FCE',
  brandDeep: '#0B1424',
  brandSoft: '#16314F',
  accent: '#F45B63',
  accentBright: '#FF7A7F',
  accentSoft: '#3B1C22',

  gold: '#F2B84B',
  goldBright: '#F7D27A',
  goldSoft: '#322613',

  background: '#0B1424',
  surface: '#162338',
  sage: '#1B2A40',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.14)',

  text: '#F8FAFC',
  textMuted: '#94A3B8',
  textFaint: '#64748B',
  textOnBrand: '#FFFFFF',

  success: '#35C98A',
  successSoft: '#123F34',
  ochre: '#F2B84B',
  ochreSoft: '#342B12',
  tealSoft: '#16314F',
  neutral: '#94A3B833',
  neutralText: '#94A3B8',
  neutralSoft: '#1B2A40',

  emergency: '#F45B63',
  emergencyForeground: '#FFD4D6',
  emergencySoft: '#3B1C22',

  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(4, 14, 32, 0.74)',

  category: {
    crime: { fg: '#FF8A8F', bg: '#3B1C22' },
    suspicious: { fg: '#F2B84B', bg: '#342B12' },
    vandalism: { fg: '#A5B4FC', bg: '#1F254A' },
    public_property: { fg: '#93C5FD', bg: '#162338' },
    traffic: { fg: '#4F9CF9', bg: '#16314F' },
    other: { fg: '#94A3B8', bg: '#1B2A40' },
  },
};

export type Colors = typeof lightColors;

export const gradients = {
  hero: ['#0B3C8D', '#D62828'] as const,
  emergency: ['#D62828', '#7F1D1D'] as const,
  success: ['#0F766E', '#115E59'] as const,
  accent: ['#D62828', '#B91C1C'] as const,
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  gutter: 18,
  lg: 24,
  xl: 32,
  xxl: 44,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const fonts = {
  serif: 'Fraunces_600SemiBold',
  serifBold: 'Fraunces_700Bold',
  serifRegular: 'Fraunces_400Regular',
  sans: 'Manrope_400Regular',
  sansMedium: 'Manrope_500Medium',
  sansSemiBold: 'Manrope_600SemiBold',
  sansBold: 'Manrope_700Bold',
  sansExtraBold: 'Manrope_800ExtraBold',
} as const;

export const serif = {
  display: { fontFamily: fonts.serifBold, fontSize: 56, lineHeight: 62, letterSpacing: -1 },
  h1: { fontFamily: fonts.serifBold, fontSize: 32, lineHeight: 38, letterSpacing: -0.6 },
  h2: { fontFamily: fonts.serif, fontSize: 24, lineHeight: 30, letterSpacing: -0.3 },
  h3: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 26, letterSpacing: -0.2 },
} as const;

export const sans = {
  eyebrow: { fontFamily: fonts.sansExtraBold, fontSize: 11, lineHeight: 15, letterSpacing: 1.6 },
  title: { fontFamily: fonts.sansBold, fontSize: 22, lineHeight: 28 },
  lead: { fontFamily: fonts.sansMedium, fontSize: 17, lineHeight: 26 },
  body: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 25 },
  small: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21 },
  label: { fontFamily: fonts.sansSemiBold, fontSize: 14, lineHeight: 20 },
  tiny: { fontFamily: fonts.sansSemiBold, fontSize: 12, lineHeight: 16, letterSpacing: 0.3 },
  button: { fontFamily: fonts.sansExtraBold, fontSize: 17, lineHeight: 22, letterSpacing: 0.3 },
  buttonSmall: { fontFamily: fonts.sansBold, fontSize: 15, lineHeight: 20, letterSpacing: 0.2 },
} as const;

export const HIT_SIZE = 48;

export const shadow = {
  card: { boxShadow: '0px 2px 8px rgba(15, 23, 42, 0.06)' },
  raised: { boxShadow: '0px 4px 12px rgba(10, 31, 68, 0.15)' },
} as const;
