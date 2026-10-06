import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { getStatus, type StatusTone } from '@/data/meta';
import { useT } from '@/i18n';
import { radius, sans, spacing, useTheme, type Colors } from '@/theme';
import type { ReportStatus } from '@/types';

export function StatusChip({ status }: { status: ReportStatus }) {
  const t = useT();
  const { colors } = useTheme();
  const { styles, TONES } = makeStyles(colors);
  const meta = getStatus(status);
  const tone = TONES[meta.tone];

  return (
    <View style={[styles.chip, { backgroundColor: tone.bg }]}>
      <Ionicons name={meta.icon} size={12} color={tone.fg} />
      <Text style={[styles.label, { color: tone.fg }]}>{t(meta.labelKey)}</Text>
    </View>
  );
}

const makeStyles = (colors: Colors) => {
  const TONES: Record<StatusTone, { bg: string; fg: string }> = {
    neutral: { bg: colors.neutralSoft, fg: colors.neutralText },
    ochre: { bg: colors.ochreSoft, fg: colors.ochre },
    teal: { bg: colors.tealSoft, fg: colors.brandForeground },
    green: { bg: colors.successSoft, fg: colors.success },
  };

  return {
    TONES,
    styles: StyleSheet.create({
      chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: radius.pill,
        alignSelf: 'flex-start',
      },
      label: { ...sans.tiny },
    }),
  };
};
