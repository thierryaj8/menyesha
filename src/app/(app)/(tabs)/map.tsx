/**
 * Map screen.
 * Placeholder matching the KigaliMap component pattern.
 * Swap KigaliMap for a real Mapbox / Google Maps SDK when ready —
 * the props (label, blurred, height) are already shaped for it.
 */
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { KigaliMap } from '@/components/KigaliMap';
import { Screen } from '@/components/Screen';
import { useT } from '@/i18n';
import { radius, sans, serif, shadow, spacing, useTheme, type Colors } from '@/theme';
import { router } from 'expo-router';

const CATEGORY_LEGEND = [
  { color: '#B91C1C', label: 'Crime' },
  { color: '#D97706', label: 'Suspicious Activity' },
  { color: '#7C3AED', label: 'Vandalism' },
  { color: '#1A56DB', label: 'Traffic / Safety' },
  { color: '#0A1F44', label: 'Public Property' },
  { color: '#475569', label: 'Other' },
];

export default function MapScreen() {
  const t = useT();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.logoIcon}>
            <Ionicons name="map" size={20} color={colors.white} />
          </View>
          <Text style={styles.title}>{t('mapScreen.title')}</Text>
        </View>
        <Text style={styles.subtitle}>{t('mapScreen.subtitle')}</Text>
      </View>

      {/* Map placeholder */}
      <KigaliMap
        label={t('mapScreen.currentArea')}
        blurred={false}
        height={320}
      />

      {/* Coming-soon note */}
      <View style={styles.notice}>
        <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
        <Text style={styles.noticeText}>{t('mapScreen.comingSoon')}</Text>
      </View>

      {/* Legend */}
      <View style={styles.legendCard}>
        <Text style={styles.legendTitle}>{t('mapScreen.legend')}</Text>
        <View style={styles.legendGrid}>
          {CATEGORY_LEGEND.map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Report CTA */}
      <Button
        label={t('mapScreen.reportHere')}
        onPress={() => router.push('/report')}
        icon={<Ionicons name="add-circle" size={20} color={colors.white} />}
      />
    </Screen>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    header: { gap: spacing.xs, marginBottom: spacing.md },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    logoIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: { ...serif.h2, color: colors.text },
    subtitle: { ...sans.small, color: colors.textMuted },
    notice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.accentSoft,
      borderRadius: radius.md,
      padding: spacing.md,
      marginTop: spacing.sm,
    },
    noticeText: { ...sans.small, color: colors.accent, flex: 1 },
    legendCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      gap: spacing.sm,
      ...shadow.card,
      marginTop: spacing.md,
    },
    legendTitle: { ...sans.label, color: colors.text },
    legendGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      width: '46%',
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    legendLabel: { ...sans.tiny, color: colors.textMuted },
  });
