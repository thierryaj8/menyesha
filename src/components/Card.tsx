import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { radius, spacing, useTheme, type Colors } from '@/theme';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: 'surface' | 'sage' | 'brand' | 'accent' | 'emergency';
}

/** Flat container: a hairline border on white, or a solid tint. No shadow. */
export function Card({ children, style, tone = 'surface' }: CardProps) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return <View style={[styles.base, styles[tone], style]}>{children}</View>;
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    base: {
      borderRadius: radius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    surface: { backgroundColor: colors.surface },
    sage: { backgroundColor: colors.sage, borderColor: 'transparent' },
    brand: { backgroundColor: colors.brand, borderColor: 'transparent' },
    accent: { backgroundColor: colors.accentSoft, borderColor: 'transparent' },
    emergency: { backgroundColor: colors.emergencySoft, borderColor: 'transparent' },
  });

export const cardSpacing = spacing;
