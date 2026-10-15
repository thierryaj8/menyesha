/**
 * Admin Portal — Dashboard
 *
 * Shows summary stats for every managed resource, recent activity,
 * and navigation cards to each management section.
 */
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Screen } from '@/components/Screen';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { ROLE_LABELS } from '@/data/adminUsers';
import { formatWhen } from '@/utils/format';
import type { ActivityAction, AdminPermission } from '@/types';
import { HIT_SIZE, radius, sans, serif, shadow, spacing, useTheme, type Colors } from '@/theme';
import { runCmsMutation } from '@/utils/cms';

interface NavCard {
  icon: string;
  titleKey: string;
  subtitleKey: string;
  route: string;
  /** Section is hidden from the grid when the admin lacks this permission. */
  permission: AdminPermission;
  accent?: boolean;
}

const NAV_CARDS: NavCard[] = [
  {
    icon: 'shield-checkmark',
    titleKey: 'admin.nav.police',
    subtitleKey: 'admin.nav.policeSub',
    route: '/admin/police',
    permission: 'manage_departments',
    accent: true,
  },
  {
    icon: 'megaphone',
    titleKey: 'admin.police.announcements',
    subtitleKey: 'admin.police.announcementsSub',
    route: '/admin/police/announcements',
    permission: 'manage_announcements',
  },
  {
    icon: 'newspaper',
    titleKey: 'admin.nav.content',
    subtitleKey: 'admin.nav.contentSub',
    route: '/admin/content',
    permission: 'manage_news',
  },
  {
    icon: 'car',
    titleKey: 'admin.nav.traffic',
    subtitleKey: 'admin.nav.trafficSub',
    route: '/admin/traffic',
    permission: 'manage_traffic_docs',
  },
  {
    icon: 'megaphone',
    titleKey: 'admin.nav.advertising',
    subtitleKey: 'admin.nav.advertisingSub',
    route: '/admin/advertising',
    permission: 'manage_ads',
  },
  {
    icon: 'bar-chart',
    titleKey: 'admin.nav.analytics',
    subtitleKey: 'admin.nav.analyticsSub',
    route: '/admin/analytics',
    permission: 'view_analytics',
  },
  {
    icon: 'people-circle',
    titleKey: 'admin.nav.users',
    subtitleKey: 'admin.nav.usersSub',
    route: '/admin/users',
    permission: 'manage_roles',
  },
];

const ACTION_ICONS: Record<ActivityAction, string> = {
  created: 'add-circle-outline',
  updated: 'create-outline',
  published: 'checkmark-circle-outline',
  unpublished: 'eye-off-outline',
  archived: 'archive-outline',
  verified: 'shield-checkmark-outline',
  suspended: 'ban-outline',
  scheduled: 'calendar-outline',
};

const AREA_COLORS: Record<'content' | 'police' | 'traffic' | 'advertising' | 'system', string> = {
  content: '#1A56DB',
  police: '#0A1F44',
  traffic: '#15803D',
  advertising: '#B45309',
  system: '#64748B',
};

export default function AdminDashboardScreen() {
  const t = useT();
  const {
    adminUser,
    departments,
    announcements,
    trafficDocs,
    articles,
    advertisements,
    webBanners,
    newsletters,
    discoverVideos,
    discoverPhotos,
    adminUsers,
    recentActivity,
    contentEngagement,
    can,
    staffLogout,
  } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  if (!adminUser) {
    return (
      <Screen>
        <Text style={styles.unauthorized}>{t('admin.unauthorized')}</Text>
      </Screen>
    );
  }

  const stats = [
    { icon: 'shield-checkmark', labelKey: 'admin.stat.departments', value: departments.length },
    { icon: 'people', labelKey: 'admin.stat.accounts', value: adminUsers.length },
    { icon: 'megaphone', labelKey: 'admin.stat.announcements', value: announcements.length },
    { icon: 'car', labelKey: 'admin.stat.trafficDocs', value: trafficDocs.length },
    { icon: 'newspaper', labelKey: 'admin.stat.articles', value: articles.filter((a) => a.status === 'published').length },
    { icon: 'play-circle', labelKey: 'admin.stat.videos', value: discoverVideos.length },
    { icon: 'images', labelKey: 'admin.stat.photos', value: discoverPhotos.length },
    { icon: 'pricetag', labelKey: 'admin.stat.ads', value: advertisements.filter((a) => a.status === 'active').length },
    { icon: 'browsers', labelKey: 'admin.stat.banners', value: webBanners.filter((b) => b.status === 'active').length },
    { icon: 'mail', labelKey: 'admin.stat.newsletters', value: newsletters.length },
  ];

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Ionicons name="settings" size={20} color={colors.white} />
          </View>
          <View>
            <Text style={styles.portalLabel}>{t('admin.portal')}</Text>
            <Text style={styles.title}>{t('admin.dashboard')}</Text>
          </View>
        </View>

        {/* Admin info */}
        <View style={styles.adminCard}>
          <View style={styles.adminAvatar}>
            <Ionicons name="person" size={22} color={colors.white} />
          </View>
          <View style={styles.adminInfo}>
            <Text style={styles.adminName}>{adminUser.username}</Text>
            <Text style={styles.adminRole}>{ROLE_LABELS[adminUser.role]}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign out of staff account"
            onPress={() => {
              void runCmsMutation('Sign out', async () => {
                await staffLogout();
                router.replace('/staff-login' as Href);
              });
            }}
            style={styles.logoutButton}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.brand} />
          </Pressable>
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>ACTIVE</Text>
          </View>
        </View>
      </View>

      {/* Stats grid */}
      <Text style={styles.sectionLabel}>{t('admin.overview')}</Text>
      <View style={styles.statsGrid}>
        {stats.map((s) => (
          <View key={s.labelKey} style={styles.statCard}>
            <Ionicons name={s.icon as any} size={22} color={colors.brand} />
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel} numberOfLines={2}>
              {t(s.labelKey as any)}
            </Text>
          </View>
        ))}
      </View>

      {/* Engagement across managed content */}
      <Text style={styles.sectionLabel}>{t('admin.dashboard.engagement')}</Text>
      <View style={styles.engagementRow}>
        <View style={styles.engagementCard}>
          <Ionicons name="eye-outline" size={20} color={colors.accent} />
          <Text style={styles.engagementValue}>
            {contentEngagement.views.toLocaleString()}
          </Text>
          <Text style={styles.engagementLabel}>{t('admin.dashboard.totalViews')}</Text>
        </View>
        <View style={styles.engagementCard}>
          <Ionicons name="download-outline" size={20} color={colors.success} />
          <Text style={styles.engagementValue}>
            {contentEngagement.downloads.toLocaleString()}
          </Text>
          <Text style={styles.engagementLabel}>{t('admin.dashboard.totalDownloads')}</Text>
        </View>
      </View>

      {/* Recent administrative activity */}
      <Text style={styles.sectionLabel}>{t('admin.dashboard.recentActivity')}</Text>
      <View style={styles.activityList}>
        {recentActivity.slice(0, 6).map((entry) => (
          <View key={entry.id} style={styles.activityRow}>
            <View style={[styles.activityIcon, { backgroundColor: AREA_COLORS[entry.area] }]}>
              <Ionicons
                name={ACTION_ICONS[entry.action] as any}
                size={14}
                color={colors.white}
              />
            </View>
            <View style={styles.activityBody}>
              <Text style={styles.activityText} numberOfLines={2}>
                {entry.description}
              </Text>
              <Text style={styles.activityMeta}>
                {t(`admin.activity.${entry.area}` as any)} · {entry.actor} ·{' '}
                {formatWhen(entry.at)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Navigation cards */}
      <Text style={styles.sectionLabel}>{t('admin.dashboard.management')}</Text>
      <View style={styles.navGrid}>
        {NAV_CARDS.filter((card) => can(card.permission)).map((card) => (
          <Pressable
            key={card.route}
            onPress={() => router.push(card.route as any)}
            accessibilityRole="button"
            accessibilityLabel={t(card.titleKey as any)}
            style={({ pressed }) => [
              styles.navCard,
              card.accent && styles.navCardAccent,
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.navIcon, card.accent && styles.navIconAccent]}>
              <Ionicons
                name={card.icon as any}
                size={24}
                color={card.accent ? colors.white : colors.brand}
              />
            </View>
            <Text style={[styles.navTitle, card.accent && styles.navTitleAccent]}>
              {t(card.titleKey as any)}
            </Text>
            <Text
              style={[styles.navSub, card.accent && styles.navSubAccent]}
              numberOfLines={2}
            >
              {t(card.subtitleKey as any)}
            </Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    unauthorized: {
      ...sans.body,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: spacing.xl,
    },
    header: { gap: spacing.md, marginBottom: spacing.lg },
    logoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    logoIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    portalLabel: { ...sans.eyebrow, color: colors.gold, letterSpacing: 1.6 },
    title: { ...serif.h2, color: colors.text },
    adminCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.brand,
      borderRadius: radius.lg,
      padding: spacing.md,
      ...shadow.raised,
    },
    adminAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255,255,255,0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    adminInfo: { flex: 1 },
    logoutButton: { width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sage },
    adminName: { ...sans.label, color: colors.white },
    adminRole: { ...sans.tiny, color: 'rgba(255,255,255,0.7)' },
    activeBadge: {
      backgroundColor: colors.gold,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
    },
    activeBadgeText: {
      fontFamily: 'Manrope_800ExtraBold',
      fontSize: 9,
      color: colors.brandDeep,
      letterSpacing: 1,
    },
    sectionLabel: {
      ...sans.eyebrow,
      color: colors.textFaint,
      letterSpacing: 1.4,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    statCard: {
      width: '18%',
      minWidth: 64,
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.sm,
      alignItems: 'center',
      gap: 3,
      ...shadow.card,
    },
    statValue: { ...serif.h2, color: colors.text, fontSize: 22 },
    statLabel: { ...sans.tiny, color: colors.textMuted, textAlign: 'center' },
    engagementRow: { flexDirection: 'row', gap: spacing.sm },
    engagementCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      gap: 2,
      ...shadow.card,
    },
    engagementValue: { ...serif.h2, color: colors.text, fontSize: 24 },
    engagementLabel: { ...sans.tiny, color: colors.textMuted },
    activityList: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    activityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    activityIcon: {
      width: 30,
      height: 30,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    activityBody: { flex: 1, gap: 1 },
    activityText: { ...sans.small, color: colors.text, fontSize: 13, lineHeight: 18 },
    activityMeta: { ...sans.tiny, color: colors.textFaint },
    navGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    navCard: {
      width: '47.5%',
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      gap: spacing.xs,
      minHeight: HIT_SIZE * 2.8,
      ...shadow.card,
    },
    navCardAccent: {
      backgroundColor: colors.brand,
      borderColor: 'transparent',
    },
    navIcon: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: colors.brandSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
    },
    navIconAccent: { backgroundColor: 'rgba(255,255,255,0.15)' },
    navTitle: { ...sans.label, color: colors.text },
    navTitleAccent: { color: colors.white },
    navSub: { ...sans.tiny, color: colors.textMuted },
    navSubAccent: { color: 'rgba(255,255,255,0.7)' },
    pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  });
