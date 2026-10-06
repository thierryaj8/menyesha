/**
 * Admin › Content Management hub.
 */
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { HIT_SIZE, radius, sans, shadow, spacing, useTheme, type Colors } from '@/theme';

export default function AdminContentScreen() {
  const t = useT();
  const { articles, discoverPosts, discoverVideos, discoverPhotos, newsletters, trafficDocs } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const sections = [
    {
      icon: 'newspaper',
      title: t('admin.content.news'),
      subtitle: t('admin.content.newsSub'),
      route: '/admin/content/news',
      count: articles.filter((a) => a.status === 'published').length,
      accent: true,
    },
    {
      icon: 'chatbox-ellipses',
      title: t('admin.content.posts'),
      subtitle: t('admin.content.postsSub'),
      route: '/admin/content/posts',
      count: discoverPosts.length,
    },
    {
      icon: 'play-circle',
      title: t('admin.content.videos'),
      subtitle: t('admin.content.videosSub'),
      route: '/admin/content/videos',
      count: discoverVideos.length,
    },
    {
      icon: 'images',
      title: t('admin.content.photos'),
      subtitle: t('admin.content.photosSub'),
      route: '/admin/content/photos',
      count: discoverPhotos.length,
    },
    {
      icon: 'mail',
      title: t('admin.content.newsletters'),
      subtitle: t('admin.content.newslettersSub'),
      route: '/admin/content/newsletters',
      count: newsletters.length,
    },
    {
      icon: 'car',
      title: t('admin.content.trafficDocs'),
      subtitle: t('admin.content.trafficDocsSub'),
      route: '/admin/traffic',
      count: trafficDocs.length,
    },
  ];

  return (
    <Screen>
      <TopBar title={t('admin.content.title')} />

      {/* Workflow note */}
      <View style={styles.workflowCard}>
        <Ionicons name="git-branch-outline" size={16} color={colors.accent} />
        <Text style={styles.workflowText}>{t('admin.content.workflow')}</Text>
      </View>

      <View style={styles.grid}>
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
              <Ionicons name={s.icon as any} size={22} color={s.accent ? colors.white : colors.brand} />
            </View>
            <Text style={[styles.cardTitle, s.accent && styles.cardTitleAccent]} numberOfLines={1}>
              {s.title}
            </Text>
            <Text style={[styles.cardSub, s.accent && styles.cardSubAccent]} numberOfLines={2}>
              {s.subtitle}
            </Text>
            <View style={[styles.countBadge, s.accent && styles.countBadgeAccent]}>
              <Text style={[styles.countText, s.accent && styles.countTextAccent]}>{s.count}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    workflowCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.accentSoft,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    workflowText: { ...sans.small, color: colors.accent, flex: 1 },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    card: {
      width: '47.5%',
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      gap: spacing.xs,
      minHeight: HIT_SIZE * 2.6,
      ...shadow.card,
    },
    cardAccent: { backgroundColor: colors.brand, borderColor: 'transparent' },
    cardIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: colors.brandSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
    },
    cardIconAccent: { backgroundColor: 'rgba(255,255,255,0.15)' },
    cardTitle: { ...sans.label, color: colors.text, fontSize: 13 },
    cardTitleAccent: { color: colors.white },
    cardSub: { ...sans.tiny, color: colors.textMuted, flex: 1 },
    cardSubAccent: { color: 'rgba(255,255,255,0.7)' },
    countBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.brandSoft,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    countBadgeAccent: { backgroundColor: 'rgba(255,255,255,0.2)' },
    countText: { ...sans.tiny, color: colors.brand },
    countTextAccent: { color: 'rgba(255,255,255,0.9)' },
    pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  });
