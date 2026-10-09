/**
 * Discover tab — entry hub for all official police content.
 * Submenu: Departments | Posts | Videos | Photos | Announcements | Campaigns
 */
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { useT } from '@/i18n';
import { HIT_SIZE, radius, sans, serif, shadow, spacing, useTheme, type Colors } from '@/theme';
import { useState } from 'react';
import { useApp } from '@/store/AppProvider';

interface DiscoverSection {
  icon: string;
  titleKey: string;
  subtitleKey: string;
  route: string;
  accent?: boolean;
  count?: number;
}

export default function DiscoverScreen() {
  const t = useT();
  const { colors } = useTheme();
  const { departments, discoverPosts, discoverVideos, discoverPhotos, announcements, campaigns } =
    useApp();
  const [query, setQuery] = useState('');
  const styles = makeStyles(colors);

  const SECTIONS: DiscoverSection[] = [
    {
      icon: 'shield-checkmark',
      titleKey: 'discover.departments',
      subtitleKey: 'discover.departmentsSubtitle',
      route: '/discover/departments',
      count: departments.filter((d) => d.isVerified && d.isActive).length,
    },
    {
      icon: 'newspaper',
      titleKey: 'discover.posts',
      subtitleKey: 'discover.postsSubtitle',
      route: '/discover/posts',
      count: discoverPosts.length,
    },
    {
      icon: 'play-circle',
      titleKey: 'discover.videos',
      subtitleKey: 'discover.videosSubtitle',
      route: '/discover/videos',
      count: discoverVideos.length,
      accent: true,
    },
    {
      icon: 'images',
      titleKey: 'discover.photos',
      subtitleKey: 'discover.photosSubtitle',
      route: '/discover/photos',
      count: discoverPhotos.length,
    },
    {
      icon: 'megaphone',
      titleKey: 'discover.announcements',
      subtitleKey: 'discover.announcementsSubtitle',
      route: '/police/announcements',
      count: announcements.length,
    },
    {
      icon: 'flag',
      titleKey: 'discover.campaigns',
      subtitleKey: 'discover.campaignsSubtitle',
      route: '/police/campaigns',
      count: campaigns.filter((c) => c.isActive).length,
    },
  ];

  const EXTRA_SECTIONS: DiscoverSection[] = [
    { icon: 'shield-half', titleKey: 'nav.policeHubTitle', subtitleKey: 'police.hubSubtitle', route: '/police' },
    { icon: 'newspaper', titleKey: 'nav.news', subtitleKey: 'police.mediaSubtitle', route: '/news' },
    { icon: 'car', titleKey: 'nav.trafficRules', subtitleKey: 'police.trafficSubtitle', route: '/traffic-rules' },
    { icon: 'notifications', titleKey: 'nav.notifications', subtitleKey: 'notifications.subtitle', route: '/notifications' },
    { icon: 'sparkles', titleKey: 'nav.acp', subtitleKey: 'acp.subtitle', route: '/acp' },
  ];

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.logoIcon}>
            <Ionicons name="compass" size={20} color={colors.white} />
          </View>
          <View>
            <Text style={styles.title}>{t('discover.title')}</Text>
            <View style={styles.officialRow}>
              <Ionicons name="checkmark-circle" size={12} color={colors.gold} />
              <Text style={styles.officialText}>{t('police.officialBadge')}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.subtitle}>{t('discover.subtitle')}</Text>
      </View>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder={t('discover.search')}
      />

      {/* Section grid */}
      <View style={styles.grid}>
        {SECTIONS.map((section) => (
          <Pressable
            key={section.route}
            onPress={() => router.push(section.route as any)}
            accessibilityRole="button"
            accessibilityLabel={t(section.titleKey as any)}
            style={({ pressed }) => [
              styles.card,
              section.accent && styles.cardAccent,
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.cardIcon, section.accent && styles.cardIconAccent]}>
              <Ionicons
                name={section.icon as any}
                size={24}
                color={section.accent ? colors.white : colors.brand}
              />
            </View>
            <Text style={[styles.cardTitle, section.accent && styles.cardTitleAccent]}>
              {t(section.titleKey as any)}
            </Text>
            <Text
              style={[styles.cardSub, section.accent && styles.cardSubAccent]}
              numberOfLines={2}
            >
              {t(section.subtitleKey as any)}
            </Text>
            {section.count !== undefined && (
              <View style={[styles.countBadge, section.accent && styles.countBadgeAccent]}>
                <Text style={[styles.countText, section.accent && styles.countTextAccent]}>
                  {section.count}
                </Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      {/* Safety, news, rules, and police hub */}
      <Text style={[styles.cardTitle, { marginTop: spacing.lg }]}>Safety services</Text>
      <View style={styles.grid}>
        {EXTRA_SECTIONS.map((section) => (
          <Pressable
            key={section.route}
            onPress={() => router.push(section.route as any)}
            accessibilityRole="button"
            accessibilityLabel={t(section.titleKey as any)}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={styles.cardIcon}>
              <Ionicons name={section.icon as any} size={24} color={colors.brand} />
            </View>
            <Text style={styles.cardTitle}>{t(section.titleKey as any)}</Text>
            <Text style={styles.cardSub} numberOfLines={2}>
              {t(section.subtitleKey as any)}
            </Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    header: { gap: spacing.xs, marginBottom: spacing.sm },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
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
    officialRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      marginTop: 1,
    },
    officialText: { ...sans.tiny, color: colors.gold, letterSpacing: 0.5 },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    card: {
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
    cardAccent: {
      backgroundColor: colors.brand,
      borderColor: 'transparent',
    },
    pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
    cardIcon: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: colors.brandSoft,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    cardIconAccent: { backgroundColor: 'rgba(255,255,255,0.15)' },
    cardTitle: { ...sans.label, color: colors.text },
    cardTitleAccent: { color: colors.white },
    cardSub: { ...sans.tiny, color: colors.textMuted },
    cardSubAccent: { color: 'rgba(255,255,255,0.7)' },
    countBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.brandSoft,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      marginTop: spacing.xs,
    },
    countBadgeAccent: { backgroundColor: 'rgba(255,255,255,0.2)' },
    countText: { ...sans.tiny, color: colors.brand },
    countTextAccent: { color: 'rgba(255,255,255,0.9)' },
  });
