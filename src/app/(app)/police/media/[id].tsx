import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { radius, sans, serif, spacing, useTheme, type Colors } from '@/theme';
import type { MediaCategory } from '@/types';

const CATEGORY_LABEL: Record<MediaCategory, string> = {
  traffic: 'Traffic',
  road_safety: 'Road Safety',
  crime_prevention: 'Crime Prevention',
  public_announcements: 'Announcements',
  community_policing: 'Community',
  general: 'General',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function ArticleDetailScreen() {
  const { colors } = useTheme();
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getArticle } = useApp();
  const styles = makeStyles(colors);

  const article = getArticle(id ?? '');

  if (!article) {
    return (
      <Screen>
        <Text style={styles.notFound}>{t('detail.notFound')}</Text>
      </Screen>
    );
  }

  const catLabel = CATEGORY_LABEL[article.category] ?? article.category;

  return (
    <Screen>
      {/* Back */}
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        style={styles.back}
      >
        <Ionicons name="arrow-back" size={22} color={colors.brand} />
        <Text style={styles.backText}>{t('common.back')}</Text>
      </Pressable>

      {/* Category */}
      <View style={styles.badgeRow}>
        <View style={styles.catBadge}>
          <Text style={styles.catText}>{catLabel}</Text>
        </View>
        <View style={styles.officialBadge}>
          <Ionicons name="shield-checkmark" size={11} color={colors.gold} />
          <Text style={styles.officialText}>{t('police.officialBadge').toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.title}>{article.title}</Text>

      {/* Meta */}
      <View style={styles.meta}>
        <Text style={styles.author}>{article.author}</Text>
        {article.publishedAt && (
          <Text style={styles.date}>{formatDate(article.publishedAt)}</Text>
        )}
      </View>

      {/* Summary */}
      <Text style={styles.summary}>{article.summary}</Text>

      {/* Body */}
      <Text style={styles.body}>{article.body}</Text>

      {/* Tags */}
      {article.tags.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('media.relatedTags')}</Text>
          <View style={styles.tagRow}>
            {article.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Screen>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    back: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    backText: { ...sans.label, color: colors.brand },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      flexWrap: 'wrap',
    },
    catBadge: {
      backgroundColor: colors.brandSoft,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },
    catText: { ...sans.tiny, color: colors.brand },
    officialBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.brand,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },
    officialText: { ...sans.tiny, color: colors.gold, letterSpacing: 0.5 },
    title: { ...serif.h1, color: colors.text },
    meta: { gap: 2 },
    author: { ...sans.label, color: colors.brand },
    date: { ...sans.small, color: colors.textMuted },
    summary: { ...sans.lead, color: colors.textMuted, lineHeight: 26 },
    body: { ...sans.body, color: colors.text, lineHeight: 27 },
    section: { gap: spacing.xs },
    sectionTitle: { ...sans.eyebrow, color: colors.textMuted },
    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    tag: {
      backgroundColor: colors.sage,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },
    tagText: { ...sans.small, color: colors.textMuted },
    notFound: { ...sans.body, color: colors.textMuted, textAlign: 'center' },
  });
