/**
 * MENYESHA design tokens.
 * Brand: deep navy blue + gold on clean white, inspired by Rwanda National Police.
 * Fraunces (serif) carries numbers and headings; Manrope carries everything else.
 */

import type { CategoryId } from '@/types';

export const lightColors = {
  // Brand — deep navy + royal blue
  brand: '#0A1F44',
  brandForeground: '#0A1F44',
  brandDark: '#061530',
  brandDeep: '#040E20',
  brandSoft: '#E8EDF7',
  accent: '#1A56DB',
  accentBright: '#3B82F6',
  accentSoft: '#DBEAFE',

  // Gold/yellow highlights — RNP style
  gold: '#D4A017',
  goldBright: '#F0C040',
  goldSoft: '#FEF3C7',

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
  success: '#15803D',
  successSoft: '#DCFCE7',
  ochre: '#B45309',
  ochreSoft: '#FEF3C7',
  tealSoft: '#DBEAFE',
  neutral: '#64748B33',
  neutralText: '#64748B',
  neutralSoft: '#F1F5F9',

  // Emergency
  emergency: '#B91C1C',
  emergencyForeground: '#B91C1C',
  emergencySoft: '#FEE2E2',

  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(10, 31, 68, 0.45)',

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
  brand: '#0A1F44',
  brandForeground: '#93C5FD',
  brandDark: '#061530',
  brandDeep: '#040E20',
  brandSoft: '#1E293B',
  accent: '#3B82F6',
  accentBright: '#60A5FA',
  accentSoft: '#1E3A5F',

  gold: '#F0C040',
  goldBright: '#FCD34D',
  goldSoft: '#3A2E0A',

  background: '#0F172A',
  surface: '#1E293B',
  sage: '#334155',
  border: '#334155',
  borderStrong: '#475569',

  text: '#F1F5F9',
  textMuted: '#94A3B8',
  textFaint: '#64748B',
  textOnBrand: '#FFFFFF',

  success: '#4ADE80',
  successSoft: '#14532D',
  ochre: '#FBBF24',
  ochreSoft: '#3A2E0A',
  tealSoft: '#1E3A5F',
  neutral: '#94A3B833',
  neutralText: '#94A3B8',
  neutralSoft: '#334155',

  emergency: '#DC2626',
  emergencyForeground: '#FCA5A5',
  emergencySoft: '#3A1A1A',

  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(4, 14, 32, 0.62)',

  category: {
    crime: { fg: '#FCA5A5', bg: '#3A1A1A' },
    suspicious: { fg: '#FCD34D', bg: '#3A2E0A' },
    vandalism: { fg: '#C4B5FD', bg: '#2E1A4A' },
    public_property: { fg: '#93C5FD', bg: '#1E293B' },
    traffic: { fg: '#60A5FA', bg: '#1E3A5F' },
    other: { fg: '#94A3B8', bg: '#334155' },
  },
};

export type Colors = typeof lightColors;

export const gradients = {
  hero: ['#0A1F44', '#1A56DB'] as const,
  emergency: ['#DC2626', '#991B1B'] as const,
  success: ['#16A34A', '#15803D'] as const,
  accent: ['#F0C040', '#D4A017'] as const,
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
