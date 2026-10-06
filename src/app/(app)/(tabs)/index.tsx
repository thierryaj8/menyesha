import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { CampaignBanner } from '@/components/CampaignBanner';
import { Card } from '@/components/Card';
import { useEmergency } from '@/components/EmergencySheet';
import { ReportCard } from '@/components/ReportCard';
import { Screen } from '@/components/Screen';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { CATEGORIES } from '@/data/meta';
import { HIT_SIZE, radius, sans, serif, shadow, spacing, useTheme, type Colors } from '@/theme';

export default function HomeScreen() {
  const t = useT();
  const { user, balance, myReports, getActiveBanner, isAdmin } = useApp();
  const { open: openEmergency } = useEmergency();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const recent = myReports.slice(0, 2);
  const banner = getActiveBanner();

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Ionicons name="shield-checkmark" size={22} color={colors.white} />
          </View>
          <Text style={styles.wordmark}>{t('common.appName')}</Text>
        </View>
        <Text style={styles.greeting}>{t('home.greeting', { name: user?.username ?? 'Arsene' })}</Text>
        <Text style={styles.safetyStatus}>{t('home.safetyStatus')}</Text>
      </View>

      {/* Primary CTA */}
      <Button
        label={t('home.reportCta')}
        onPress={() => router.push('/report')}
        icon={<Ionicons name="add-circle" size={22} color={colors.white} />}
      />

      {/* Emergency */}
      <Pressable
        onPress={openEmergency}
        accessibilityRole="button"
        accessibilityLabel={t('home.emergencyCta')}
        style={({ pressed }) => [styles.emergencyBtn, pressed && styles.pressed]}
      >
        <Ionicons name="call" size={20} color={colors.white} />
        <Text style={styles.emergencyText}>{t('home.emergencyCta')}</Text>
      </Pressable>
      <Text style={styles.emergencyNote}>{t('home.emergencyNote')}</Text>

      {/* Campaign banner — only shown when an active home_banner campaign exists */}
      {banner && <CampaignBanner campaign={banner} />}

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.categoriesTitle')}</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((category) => {
            const palette = colors.category[category.id];
            return (
              <Pressable
                key={category.id}
                onPress={() => router.push('/report')}
                accessibilityRole="button"
                accessibilityLabel={t(category.labelKey)}
                style={({ pressed }) => [
                  styles.categoryCard,
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.categoryIcon, { backgroundColor: palette.bg }]}>
                  <Ionicons name={category.icon} size={24} color={palette.fg} />
                </View>
                <Text style={styles.categoryLabel}>{t(category.labelKey)}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Rewards */}
      <Card tone="brand" style={styles.rewardsCard}>
        <View style={styles.rewardsHeader}>
          <Text style={styles.rewardsTitle}>{t('home.pointsTitle')}</Text>
          <Ionicons name="trophy" size={20} color={colors.gold} />
        </View>
        <Text style={styles.rewardsPoints}>{balance.toLocaleString()} Points</Text>
        <Text style={styles.rewardsNote}>{t('home.pointsNote')}</Text>
        <Pressable
          onPress={() => router.push('/rewards')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.rewardsBtn, pressed && styles.pressed]}
        >
          <Text style={styles.rewardsBtnText}>{t('home.viewRewards')}</Text>
        </Pressable>
      </Card>

      {/* Recent reports */}
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>{t('home.recent')}</Text>
          <Pressable
            onPress={() => router.push('/reports')}
            accessibilityRole="link"
            style={styles.seeAll}
          >
            <Text style={styles.seeAllText}>{t('home.seeAll')}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.brandForeground} />
          </Pressable>
        </View>

        {recent.length === 0 ? (
          <Text style={styles.empty}>{t('home.noReports')}</Text>
        ) : (
          <View style={styles.list}>
            {recent.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onPress={() => router.push(`/report/${report.id}`)}
              />
            ))}
          </View>
        )}
      </View>

      {/* Admin portal entry — only visible to admin users */}
      {isAdmin && (
        <Pressable
          onPress={() => router.push('/admin' as any)}
          accessibilityRole="button"
          accessibilityLabel={t('profile.adminPortal')}
          style={({ pressed }) => [styles.adminEntry, pressed && styles.pressed]}
        >
          <View style={styles.adminEntryIcon}>
            <Ionicons name="settings" size={20} color={colors.white} />
          </View>
          <View style={styles.adminEntryBody}>
            <Text style={styles.adminEntryTitle}>{t('profile.adminPortal')}</Text>
            <Text style={styles.adminEntrySub}>{t('profile.adminPortalNote')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
        </Pressable>
      )}
    </Screen>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  header: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  logoRow: {
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
  wordmark: {
    ...sans.eyebrow,
    color: colors.brand,
    letterSpacing: 2.4,
    fontSize: 13,
  },
  greeting: {
    ...serif.h1,
    color: colors.text,
  },
  safetyStatus: {
    ...sans.lead,
    color: colors.textMuted,
  },

  emergencyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.emergency,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: HIT_SIZE,
    marginTop: spacing.sm,
    ...shadow.raised,
  },
  emergencyText: {
    ...sans.button,
    color: colors.white,
  },
  emergencyNote: {
    ...sans.small,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  section: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...serif.h2,
    color: colors.text,
    flex: 1,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  seeAllText: {
    ...sans.buttonSmall,
    color: colors.brandForeground,
  },
  empty: {
    ...sans.body,
    color: colors.textMuted,
  },
  list: {
    gap: spacing.sm,
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadow.card,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    ...sans.label,
    color: colors.text,
    textAlign: 'center',
    fontSize: 13,
  },

  rewardsCard: {
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  rewardsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rewardsTitle: {
    ...sans.eyebrow,
    color: colors.gold,
    letterSpacing: 1.6,
  },
  rewardsPoints: {
    ...serif.display,
    color: colors.white,
  },
  rewardsNote: {
    ...sans.small,
    color: 'rgba(255,255,255,0.75)',
  },
  rewardsBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  rewardsBtnText: {
    ...sans.buttonSmall,
    color: colors.brandDeep,
  },

  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  adminEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.brand,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
    ...shadow.raised,
  },
  adminEntryIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminEntryBody: { flex: 1 },
  adminEntryTitle: { ...sans.label, color: colors.white },
  adminEntrySub: { ...sans.tiny, color: 'rgba(255,255,255,0.7)' },
});
