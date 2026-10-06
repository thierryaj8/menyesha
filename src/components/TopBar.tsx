import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useT } from '@/i18n';
import { HIT_SIZE, sans, serif, spacing, useTheme, type Colors } from '@/theme';

interface TopBarProps {
  onBack?: () => void;
  step?: { current: number; total: number };
  title?: string;
}

/** Back button + "Step 1 of 3". Big targets, no chrome to read. */
export function TopBar({ onBack, step, title }: TopBarProps) {
  const t = useT();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <View style={styles.row}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          >
            <Ionicons name="arrow-back" size={22} color={colors.brandForeground} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.center}>
        {step ? (
          <Text style={styles.step}>
            {t('report.step', { current: step.current, total: step.total })}
          </Text>
        ) : null}
        {title ? <Text style={styles.title}>{title}</Text> : null}
      </View>

      <View style={styles.side} />
    </View>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: HIT_SIZE + 8,
      gap: spacing.sm,
    },
    side: { width: HIT_SIZE + 8, alignItems: 'flex-start' },
    center: { flex: 1, alignItems: 'center', gap: 2 },
    back: {
      width: HIT_SIZE,
      height: HIT_SIZE,
      borderRadius: HIT_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pressed: { backgroundColor: colors.sage },
    step: { ...sans.small, color: colors.textMuted },
    title: { ...serif.h3, color: colors.text },
  });
