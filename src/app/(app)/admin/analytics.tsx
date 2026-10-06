/**
 * Admin › Analytics Overview
 * Impressions, views, clicks, CTR, shares, engagement across all ads and banners.
 */
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { radius, sans, serif, shadow, spacing, useTheme, type Colors } from '@/theme';

export default function AdminAnalyticsScreen() {
  const t = useT();
  const { advertisements, campaigns } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  // Aggregate ad metrics
  const totalImpressions = advertisements.reduce((s, a) => s + a.impressions, 0);
  const totalClicks = advertisements.reduce((s, a) => s + a.clicks, 0);
  const totalViews = advertisements.reduce((s, a) => s + a.views, 0);
  const totalShares = advertisements.reduce((s, a) => s + a.shares, 0);
  const overallCtr =
    totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  // Campaign metrics
  const totalCampViews = campaigns.reduce((s, c) => s + c.views, 0);
  const totalCampClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
  const campCtr =
    totalCampViews > 0 ? ((totalCampClicks / totalCampViews) * 100).toFixed(2) : '0.00';

  // Top performer by clicks
  const topAd = advertisements.reduce(
    (best, a) => (a.clicks > (best?.clicks ?? 0) ? a : best),
    advertisements[0] ?? null,
  );

  const metricCards = [
    { icon: 'eye', label: t('admin.ads.impressions'), value: totalImpressions.toLocaleString(), color: colors.brand },
    { icon: 'play-circle', label: t('admin.ads.views'), value: totalViews.toLocaleString(), color: colors.accent },
    { icon: 'cursor', label: t('admin.ads.clicks'), value: totalClicks.toLocaleString(), color: colors.gold },
    { icon: 'trending-up', label: t('admin.ads.ctr'), value: `${overallCtr}%`, color: colors.success },
    { icon: 'share-social', label: t('admin.ads.shares'), value: totalShares.toLocaleString(), color: '#7C3AED' },
    { icon: 'flag', label: t('admin.analytics.campaignViews'), value: totalCampViews.toLocaleString(), color: '#0A1F44' },
    { icon: 'pulse-outline', label: t('admin.analytics.campaignCtr'), value: `${campCtr}%`, color: colors.ochre },
  ];

  const adRows = [...advertisements]
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);

  const campaignRows = [...campaigns]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return (
    <Screen>
      <TopBar title={t('admin.analytics.title')} />

      {/* Metric cards */}
      <Text style={styles.sectionLabel}>{t('admin.analytics.allTimeTotals')}</Text>
      <View style={styles.metricGrid}>
        {metricCards.map((m) => (
          <View key={m.label} style={[styles.metricCard, { borderTopColor: m.color, borderTopWidth: 3 }]}>
            <Ionicons name={m.icon as any} size={20} color={m.color} />
            <Text style={styles.metricValue}>{m.value}</Text>
            <Text style={styles.metricLabel} numberOfLines={2}>{m.label}</Text>
          </View>
        ))}
      </View>

      {/* Top ad */}
      {topAd && (
        <>
          <Text style={styles.sectionLabel}>{t('admin.analytics.topAd')}</Text>
          <View style={styles.topCard}>
            <Ionicons name="trophy" size={22} color={colors.gold} />
            <View style={styles.topBody}>
              <Text style={styles.topTitle}>{topAd.title}</Text>
              <Text style={styles.topMeta}>{topAd.campaignName}</Text>
            </View>
            <View style={styles.topStats}>
              <Text style={styles.topStatValue}>{topAd.clicks.toLocaleString()}</Text>
              <Text style={styles.topStatLabel}>clicks</Text>
            </View>
          </View>
        </>
      )}

      {/* Ad performance table */}
      <Text style={styles.sectionLabel}>Top Ads by Clicks</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 3 }]}>Ad</Text>
          <Text style={[styles.tableCell, styles.tableHeaderText]}>Impr.</Text>
          <Text style={[styles.tableCell, styles.tableHeaderText]}>Clicks</Text>
          <Text style={[styles.tableCell, styles.tableHeaderText]}>CTR</Text>
        </View>
        {adRows.map((ad) => {
          const ctr = ad.impressions > 0
            ? ((ad.clicks / ad.impressions) * 100).toFixed(1)
            : '—';
          return (
            <View key={ad.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]} numberOfLines={1}>{ad.title}</Text>
              <Text style={styles.tableCell}>{ad.impressions.toLocaleString()}</Text>
              <Text style={styles.tableCell}>{ad.clicks.toLocaleString()}</Text>
              <Text style={styles.tableCell}>{ctr}%</Text>
            </View>
          );
        })}
      </View>

      {/* Campaign performance */}
      <Text style={styles.sectionLabel}>Top Campaigns by Views</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 3 }]}>Campaign</Text>
          <Text style={[styles.tableCell, styles.tableHeaderText]}>Views</Text>
          <Text style={[styles.tableCell, styles.tableHeaderText]}>Clicks</Text>
        </View>
        {campaignRows.map((c) => (
          <View key={c.id} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 3 }]} numberOfLines={1}>{c.title}</Text>
            <Text style={styles.tableCell}>{c.views.toLocaleString()}</Text>
            <Text style={styles.tableCell}>{c.clicks.toLocaleString()}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    sectionLabel: {
      ...sans.eyebrow,
      color: colors.textFaint,
      letterSpacing: 1.2,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    metricGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    metricCard: {
      width: '30%',
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      alignItems: 'center',
      gap: spacing.xs,
      ...shadow.card,
    },
    metricValue: { ...serif.h2, color: colors.text, fontSize: 20 },
    metricLabel: { ...sans.tiny, color: colors.textMuted, textAlign: 'center' },
    topCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.goldSoft,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.gold,
      padding: spacing.md,
    },
    topBody: { flex: 1 },
    topTitle: { ...sans.label, color: colors.text },
    topMeta: { ...sans.tiny, color: colors.textMuted },
    topStats: { alignItems: 'center' },
    topStatValue: { ...serif.h2, color: colors.text, fontSize: 20 },
    topStatLabel: { ...sans.tiny, color: colors.textMuted },
    table: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    tableHeader: { backgroundColor: colors.sage },
    tableHeaderText: { ...sans.label, color: colors.textMuted, fontSize: 11 },
    tableCell: {
      flex: 1,
      ...sans.small,
      color: colors.text,
      fontSize: 12,
      lineHeight: 18,
    },
  });
