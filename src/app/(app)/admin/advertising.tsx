/**
 * Admin › Advertising hub.
 * Ads list, banners, and analytics.
 */
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { HIT_SIZE, radius, sans, shadow, spacing, useTheme, type Colors } from '@/theme';

export default function AdminAdvertisingScreen() {
  const t = useT();
  const { advertisements, webBanners, campaigns } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const activeAds = advertisements.filter((a) => a.status === 'active');
  const activeBanners = webBanners.filter((b) => b.status === 'active');

  const totalImpressions = advertisements.reduce((sum, a) => sum + a.impressions, 0);
  const totalClicks = advertisements.reduce((sum, a) => sum + a.clicks, 0);
  const overallCtr = totalImpressions > 0
    ? ((totalClicks / totalImpressions) * 100).toFixed(1)
    : '0.0';

  const sections = [
    {
      icon: 'pricetag',
      title: t('admin.ads.list'),
      subtitle: t('admin.ads.listSub'),
      route: '/admin/ads',
      count: advertisements.length,
      activeCount: activeAds.length,
      accent: true,
    },
    {
      icon: 'megaphone',
      title: 'Campaigns',
      subtitle: 'Manage campaign placements and dates',
      route: '/admin/campaigns',
      count: campaigns.length,
    },
    {
      icon: 'browsers',
      title: t('admin.ads.banners'),
      subtitle: t('admin.ads.bannersSub'),
      route: '/admin/banners',
      count: webBanners.length,
      activeCount: activeBanners.length,
    },
    {
      icon: 'bar-chart',
      title: t('admin.ads.analytics'),
      subtitle: t('admin.ads.analyticsSub'),
      route: '/admin/analytics',
      count: null,
    },
  ];

  return (
    <Screen>
      <TopBar title={t('admin.nav.advertising')} />

      {/* Quick analytics row */}
      <View style={styles.quickStats}>
        <View style={styles.quickStat}>
          <Text style={styles.quickValue}>{totalImpressions.toLocaleString()}</Text>
          <Text style={styles.quickLabel}>{t('admin.ads.impressions')}</Text>
        </View>
        <View style={styles.quickDivider} />
        <View style={styles.quickStat}>
          <Text style={styles.quickValue}>{totalClicks.toLocaleString()}</Text>
          <Text style={styles.quickLabel}>{t('admin.ads.clicks')}</Text>
        </View>
        <View style={styles.quickDivider} />
        <View style={styles.quickStat}>
          <Text style={styles.quickValue}>{overallCtr}%</Text>
          <Text style={styles.quickLabel}>{t('admin.ads.ctr')}</Text>
        </View>
      </View>

      <View style={styles.list}>
        {sections.map((s) => (
          <Pressable
            key={s.route}
            onPress={() => router.push(s.route as any)}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.card,
              s.accent && styles.cardAccent,
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.cardIcon, s.accent && styles.cardIconAccent]}>
              <Ionicons name={s.icon as any} size={24} color={s.accent ? colors.white : colors.brand} />
            </View>
            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, s.accent && styles.cardTitleAccent]}>{s.title}</Text>
              <Text style={[styles.cardSub, s.accent && styles.cardSubAccent]} numberOfLines={2}>
                {s.subtitle}
              </Text>
            </View>
            {s.count !== null && (
              <View style={styles.countCol}>
                <Text style={[styles.countValue, s.accent && styles.countValueAccent]}>{s.count}</Text>
                <Text style={[styles.countLabel, s.accent && styles.countLabelAccent]}>total</Text>
                {s.activeCount !== undefined && (
                  <>
                    <Text style={[styles.countValue, { color: colors.success }]}>{s.activeCount}</Text>
                    <Text style={[styles.countLabel, s.accent && styles.countLabelAccent]}>active</Text>
                  </>
                )}
              </View>
            )}
            <Ionicons
              name="chevron-forward"
              size={18}
              color={s.accent ? 'rgba(255,255,255,0.5)' : colors.textFaint}
            />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    quickStats: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      marginBottom: spacing.lg,
      ...shadow.card,
    },
    quickStat: { flex: 1, alignItems: 'center', gap: 3 },
    quickValue: { fontFamily: 'Fraunces_700Bold', fontSize: 22, color: colors.text },
    quickLabel: { ...sans.tiny, color: colors.textMuted, textAlign: 'center' },
    quickDivider: {
      width: 1, backgroundColor: colors.border, marginVertical: spacing.xs,
    },
    list: { gap: spacing.sm },
    card: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.md,
      backgroundColor: colors.surface, borderRadius: radius.lg,
      borderWidth: 1, borderColor: colors.border, padding: spacing.md,
      minHeight: HIT_SIZE, ...shadow.card,
    },
    cardAccent: { backgroundColor: colors.brand, borderColor: 'transparent' },
    cardIcon: {
      width: 48, height: 48, borderRadius: radius.md,
      backgroundColor: colors.brandSoft, alignItems: 'center', justifyContent: 'center',
    },
    cardIconAccent: { backgroundColor: 'rgba(255,255,255,0.15)' },
    cardBody: { flex: 1, gap: 3 },
    cardTitle: { ...sans.label, color: colors.text },
    cardTitleAccent: { color: colors.white },
    cardSub: { ...sans.tiny, color: colors.textMuted },
    cardSubAccent: { color: 'rgba(255,255,255,0.7)' },
    countCol: { alignItems: 'center' },
    countValue: { fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: colors.text },
    countValueAccent: { color: colors.white },
    countLabel: { ...sans.tiny, color: colors.textMuted },
    countLabelAccent: { color: 'rgba(255,255,255,0.6)' },
    pressed: { opacity: 0.85 },
  });
