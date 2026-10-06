import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { radius, sans, spacing, useTheme, type Colors } from '@/theme';

type Variant = 'primary' | 'secondary' | 'accent' | 'quiet' | 'emergency';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}

const HEIGHT = 52;

/**
 * Flat, solid buttons. Primary and accent are filled, secondary is outlined,
 * quiet is a soft tint. No shadows — hierarchy comes from fill and contrast.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  loading,
  style,
  accessibilityHint,
}: ButtonProps) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const isDisabled = disabled || loading;
  const filled = variant === 'primary' || variant === 'emergency' || variant === 'accent';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={filled ? colors.white : colors.brandForeground} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, styles[`${variant}Label` as const]]} numberOfLines={1}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    base: {
      minHeight: HEIGHT,
      borderRadius: radius.md,
      paddingHorizontal: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    label: { ...sans.button, textAlign: 'center', fontWeight: '600' },
    pressed: { opacity: 0.85 },
    disabled: { opacity: 0.45 },

    primary: { backgroundColor: colors.brand },
    primaryLabel: { color: colors.white },

    secondary: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderStrong,
    },
    secondaryLabel: { color: colors.brandForeground },

    accent: { backgroundColor: colors.accent },
    accentLabel: { color: colors.white },

    quiet: { backgroundColor: colors.sage },
    quietLabel: { color: colors.brandForeground },

    emergency: { backgroundColor: colors.emergency },
    emergencyLabel: { color: colors.white },
  });
