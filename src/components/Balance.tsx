import { StyleSheet, Text, View } from 'react-native';
import { useT } from '@/i18n';
import { serif, sans, spacing, useTheme, type Colors } from '@/theme';
import { formatNumber, pointsToRwf } from '@/utils/format';

interface BalanceProps {
  points: number;
  caption?: string;
  size?: 'display' | 'hero';
  /** "onDark" is for the gradient hero cards. */
  tone?: 'brand' | 'onDark';
}

/** Big serif number with the RWF value underneath. */
export function Balance({ points, caption, size = 'hero', tone = 'brand' }: BalanceProps) {
  const t = useT();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const rwf = pointsToRwf(points);
  const onDark = tone === 'onDark';

  return (
    <View style={styles.wrap}>
      <View style={styles.numberRow}>
        <Text
          style={[styles.number, size === 'display' && styles.display, onDark && styles.onDark]}
        >
          {points}
        </Text>
        <Text style={[styles.unit, onDark && styles.unitDark]}>{t('home.pointsLabel')}</Text>
      </View>
      <Text style={[styles.rwf, onDark && styles.onDark]}>
        {t('home.pointsRwf', { rwf: formatNumber(rwf) })}
      </Text>
      <Text style={[styles.caption, onDark && styles.mutedDark]}>
        {caption ?? t('common.oneFixPoint')}
      </Text>
    </View>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    wrap: { gap: spacing.xs },
    numberRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
    number: { ...serif.display, color: colors.brandForeground },
    display: { fontSize: 64, lineHeight: 70, letterSpacing: -1.5 },
    unit: { ...serif.h3, color: colors.textMuted },
    rwf: { ...sans.lead, color: colors.text },
    caption: { ...sans.small, color: colors.textMuted },

    onDark: { color: colors.white },
    unitDark: { color: 'rgba(255,255,255,0.72)' },
    mutedDark: { color: 'rgba(255,255,255,0.78)' },
  });
