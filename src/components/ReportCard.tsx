import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getCategory } from '@/data/meta';
import { useT } from '@/i18n';
import { fonts, radius, sans, spacing, useTheme, type Colors } from '@/theme';
import type { Report } from '@/types';
import { StatusChip } from './StatusChip';

/** One report in a list. Flat card: category icon, title, area, status. */
export function ReportCard({ report, onPress }: { report: Report; onPress: () => void }) {
  const t = useT();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const category = getCategory(report.categoryId);
  const palette = colors.category[report.categoryId];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${t(category?.labelKey ?? '')}: ${report.description}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.iconWrap, { backgroundColor: palette.bg }]}>
        <Ionicons name={category?.icon ?? 'alert-circle-outline'} size={20} color={palette.fg} />
      </View>

      <View style={styles.body}>
        <Text style={styles.reportId}>{report.id}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {t(category?.labelKey ?? '')}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {report.area}
        </Text>
        <View style={styles.chip}>
          <StatusChip status={report.status} />
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
    </Pressable>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      minHeight: 76,
    },
    pressed: { backgroundColor: colors.sage },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: { flex: 1, gap: 2 },
    reportId: { ...sans.tiny, color: colors.textFaint, fontFamily: fonts.sansSemiBold },
    title: { ...sans.label, color: colors.text },
    meta: { ...sans.small, color: colors.textMuted },
    chip: { marginTop: spacing.xs },
  });
