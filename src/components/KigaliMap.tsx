import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useT } from '@/i18n';
import { radius, sans, spacing, useTheme, type Colors } from '@/theme';

interface KigaliMapProps {
  /** Shown on the map, e.g. "Kimironko". */
  label?: string;
  height?: number;
  /**
   * Community view: only the general area is shown, never the exact pin.
   * Swap this component for the Mapbox / Google Maps SDK when the API lands —
   * the props are deliberately the same.
   */
  blurred?: boolean;
  footnote?: string;
  children?: ReactNode;
}

const HORIZONTAL_ROADS = ['28%', '62%', '86%'] as const;
const VERTICAL_ROADS = ['22%', '54%', '78%'] as const;
const BLOCKS = [
  { top: '8%', left: '4%', width: '14%', height: '14%' },
  { top: '34%', left: '60%', width: '16%', height: '18%' },
  { top: '68%', left: '8%', width: '18%', height: '14%' },
  { top: '72%', left: '66%', width: '14%', height: '12%' },
  { top: '12%', left: '70%', width: '12%', height: '10%' },
] as const;

export function KigaliMap({ label, height = 180, blurred, footnote, children }: KigaliMapProps) {
  const t = useT();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <View style={[styles.map, { height }]} accessibilityLabel={label ?? t('map.title')}>
      {BLOCKS.map((block, index) => (
        <View key={index} style={[styles.block, block]} />
      ))}

      {HORIZONTAL_ROADS.map((top) => (
        <View key={`h-${top}`} style={[styles.roadH, { top }]} />
      ))}
      {VERTICAL_ROADS.map((left) => (
        <View key={`v-${left}`} style={[styles.roadV, { left }]} />
      ))}
      <View style={styles.roadDiagonal} />

      <View style={styles.river} />

      {blurred ? (
        <View style={styles.blurArea}>
          <Ionicons name="eye-off-outline" size={16} color={colors.brandForeground} />
          <Text style={styles.blurText}>{t('map.generalArea')}</Text>
        </View>
      ) : (
        <View style={styles.pinWrap}>
          <View style={styles.pinHalo} />
          <Ionicons name="location" size={36} color={colors.brandForeground} />
        </View>
      )}

      {label ? (
        <View style={styles.labelChip}>
          <Ionicons name="pin" size={13} color={colors.brandForeground} />
          <Text style={styles.labelText} numberOfLines={1}>
            {label}
          </Text>
        </View>
      ) : null}

      {footnote ? (
        <View style={styles.footnote}>
          <Text style={styles.footnoteText}>{footnote}</Text>
        </View>
      ) : null}

      {children}
    </View>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    map: {
      borderRadius: radius.md,
      backgroundColor: '#EEF1EA',
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    },
    block: { position: 'absolute', backgroundColor: '#E2E8DC', borderRadius: 3 },
    roadH: { position: 'absolute', left: 0, right: 0, height: 8, backgroundColor: '#FAFAF6' },
    roadV: { position: 'absolute', top: 0, bottom: 0, width: 8, backgroundColor: '#FAFAF6' },
    roadDiagonal: {
      position: 'absolute',
      width: '150%',
      height: 10,
      backgroundColor: '#FAFAF6',
      transform: [{ rotate: '34deg' }],
    },
    river: {
      position: 'absolute',
      width: '160%',
      height: 22,
      backgroundColor: '#D6E4E0',
      transform: [{ rotate: '-22deg' }],
      top: '74%',
    },
    pinWrap: { alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' },
    pinHalo: {
      position: 'absolute',
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: 'rgba(31, 75, 67, 0.12)',
    },
    blurArea: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: 'rgba(255,255,255,0.85)',
      borderWidth: 1,
      borderColor: colors.borderStrong,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      pointerEvents: 'none',
    },
    blurText: { ...sans.tiny, color: colors.brandForeground },
    labelChip: {
      position: 'absolute',
      left: spacing.sm,
      bottom: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.surface,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: colors.border,
      maxWidth: '85%',
    },
    labelText: { ...sans.tiny, color: colors.text },
    footnote: {
      position: 'absolute',
      right: spacing.sm,
      bottom: spacing.sm,
      backgroundColor: 'rgba(255,255,255,0.92)',
      borderRadius: radius.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      maxWidth: '55%',
    },
    footnoteText: { ...sans.tiny, color: colors.textMuted },
  });
