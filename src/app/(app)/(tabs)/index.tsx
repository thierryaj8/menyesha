import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CampaignBanner } from '@/components/CampaignBanner';
import { Card } from '@/components/Card';
import { useEmergency } from '@/components/EmergencySheet';
import { MobileHeader } from '@/components/MobileHeader';
import { ReportCard } from '@/components/ReportCard';
import { Screen } from '@/components/Screen';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { CATEGORIES } from '@/data/meta';
import { radius, sans, serif, shadow, spacing, useTheme, type Colors } from '@/theme';

export default function HomeScreen() {
  const t = useT();
  const { user, balance, myReports, getActiveBanner } = useApp();
  const { open: openEmergency } = useEmergency();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const recent = myReports.slice(0, 2);
  const banner = getActiveBanner();

  return (
    <Screen header={<MobileHeader />} contentStyle={styles.screenContent}>
      {/* Greeting — compact, answers "what can I do here?" immediately */}
      <View style={styles.greetingBlock}>
        <Text style={styles.greeting}>
          {t('home.greeting', { name: user?.username ?? 'Citizen' })}.
        </Text>
        <Text style={styles.greetingNote}>{t('home.heroNote')}</Text>
      </View>

      {/* Primary action: report */}
      <View style={styles.ctaBlock}>
        <Pressable
          onPress={() => router.push('/report')}
          accessibilityRole="button"
          accessibilityLabel={t('home.reportCta')}
          style={({ pressed }) => [styles.primaryCta, pressed && styles.ctaPressed]}
        >
          <View style={styles.ctaIcon}>
            <Ionicons name="add" size={22} color={colors.white} />
          </View>
          <Text style={styles.ctaLabel}>{t('home.reportCta')}</Text>
          <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.85)" />
        </Pressable>
        <Text style={styles.ctaNote}>{t('home.reportNote')}</Text>
      </View>

      {/* Emergency: unmistakable but visually secondary to reporting */}
      <Pressable
        onPress={openEmergency}
        accessibilityRole="button"
        accessibilityLabel={t('home.emergencyCta')}
        style={({ pressed }) => [styles.emergencyCard, pressed && styles.ctaPressed]}
      >
        <View style={styles.emergencyIcon}>
          <Ionicons name="call" size={20} color={colors.white} />
        </View>
        <View style={styles.emergencyBody}>
          <Text style={styles.emergencyEyebrow}>{t('home.emergencyLabel')}</Text>
          <Text style={styles.emergencyTitle}>{t('home.emergencyCta')}</Text>
          <Text style={styles.emergencyNote}>{t('home.emergencyNote')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.emergency} />
      </Pressable>

      {/* ACP civic assistant */}
      <Pressable
        onPress={() => router.push('/acp')}
        accessibilityRole="button"
        accessibilityLabel="Ask ACP"
        style={({ pressed }) => [styles.acpCard, pressed && styles.ctaPressed]}
      >
        <View style={styles.acpAvatar}>
          <Ionicons name="sparkles" size={18} color={colors.white} />
        </View>
        <View style={{ flex: 1, gap: 1 }}>
          <Text style={styles.acpTitle}>Ask ACP</Text>
          <Text style={styles.acpSub}>File reports, check status, or learn about RNP — via text commands.</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.brand} />
      </Pressable>

      {/* Safety campaign */}
      {banner && <CampaignBanner campaign={banner} />}

      {/* Report categories — high on the page */}
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
                style={({ pressed }) => [styles.categoryCard, pressed && styles.cardPressed]}
              >
                <View style={[styles.categoryIcon, { backgroundColor: palette.bg }]}>
                  <Ionicons name={category.icon} size={22} color={palette.fg} />
                </View>
                <Text style={styles.categoryLabel}>{t(category.labelKey)}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Recent activity */}
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>{t('home.recent')}</Text>
          <Pressable onPress={() => router.push('/reports')} accessibilityRole="link" style={styles.seeAll}>
            <Text style={styles.seeAllText}>{t('home.seeAll')}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.brandForeground} />
          </Pressable>
        </View>

        {recent.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="document-text-outline" size={24} color={colors.textFaint} />
            <Text style={styles.empty}>{t('home.noReports')}</Text>
          </View>
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

      <Card tone="brand" style={styles.rewardsCard}>
        <View style={styles.rewardsHeader}>
          <View>
            <Text style={styles.eyebrow}>Citizen engagement</Text>
            <Text style={styles.rewardsTitle}>{t('home.pointsTitle')}</Text>
          </View>
          <View style={styles.trophyWrap}>
            <Ionicons name="trophy-outline" size={19} color={colors.white} />
          </View>
        </View>
        <Text style={styles.rewardsPoints}>{balance.toLocaleString()} points</Text>
        <Text style={styles.rewardsNote}>{t('home.pointsNote')}</Text>
        <Pressable
          onPress={() => router.push('/rewards')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.rewardsBtn, pressed && styles.ctaPressed]}
        >
          <Text style={styles.rewardsBtnText}>{t('home.viewRewards')}</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.brandDeep} />
        </Pressable>
      </Card>
    </Screen>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  screenContent: { gap: spacing.md, paddingTop: spacing.md },
  greetingBlock: { gap: 4 },
  greeting: { ...sans.title, color: colors.text, fontSize: 24, lineHeight: 30 },
  greetingNote: { ...sans.small, color: colors.textMuted, fontSize: 14 },
  ctaBlock: { gap: spacing.xs },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.brand,
    borderRadius: 16,
    height: 56,
    paddingHorizontal: spacing.md,
    ...shadow.raised,
  },
  ctaIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: { flex: 1, fontFamily: 'Manrope_800ExtraBold', fontSize: 16, letterSpacing: 1.2, color: colors.white },
  ctaNote: { ...sans.tiny, color: colors.textMuted },
  ctaPressed: { opacity: 0.92, transform: [{ scale: 0.985 }] },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(244, 91, 99, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(244, 91, 99, 0.28)',
    borderRadius: 16,
    padding: spacing.md,
  },
  acpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.brandSoft,
    borderWidth: 1,
    borderColor: 'rgba(79,156,249,0.25)',
    borderRadius: 16,
    padding: spacing.md,
  },
  acpAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acpTitle: { fontFamily: 'Manrope_800ExtraBold', fontSize: 15, color: colors.brandForeground },
  acpSub: { ...sans.tiny, color: colors.textMuted },
  emergencyIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.emergency,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyBody: { flex: 1, gap: 1 },
  emergencyEyebrow: { ...sans.eyebrow, color: colors.emergency, letterSpacing: 1.6 },
  emergencyTitle: { fontFamily: 'Manrope_800ExtraBold', fontSize: 16, letterSpacing: 1, color: colors.text },
  emergencyNote: { ...sans.tiny, color: colors.textMuted },
  section: { gap: spacing.sm },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { ...sans.title, color: colors.text, fontSize: 18, lineHeight: 26 },
  eyebrow: { ...sans.eyebrow, color: colors.brandForeground, letterSpacing: 1.3 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  categoryCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'flex-start',
    gap: spacing.sm,
    minHeight: 96,
  },
  categoryIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  categoryLabel: { ...sans.label, color: colors.text, fontSize: 13, lineHeight: 18 },
  cardPressed: { opacity: 0.94, transform: [{ scale: 0.98 }] },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seeAllText: { ...sans.label, color: colors.brandForeground, fontSize: 12 },
  list: { gap: spacing.sm },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  empty: { ...sans.small, color: colors.textMuted, textAlign: 'center' },
  rewardsCard: { gap: spacing.sm, padding: spacing.lg },
  rewardsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  trophyWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardsTitle: { ...sans.title, color: colors.white },
  rewardsPoints: { ...serif.h2, color: colors.white, fontSize: 34 },
  rewardsNote: { ...sans.small, color: 'rgba(255,255,255,0.72)' },
  rewardsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  rewardsBtnText: { ...sans.label, color: colors.brandDeep },
});
