import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { MediaArticle, MediaCategory } from '@/types';
import { HIT_SIZE, radius, sans, spacing, useTheme, type Colors } from '@/theme';

interface ArticleCardProps {
  item: MediaArticle;
  onPress: () => void;
}

const CATEGORY_ICON: Record<MediaCategory, string> = {
  traffic: 'car',
  road_safety: 'shield',
  crime_prevention: 'lock-closed',
  public_announcements: 'megaphone',
  community_policing: 'people',
  general: 'newspaper',
};

const CATEGORY_LABEL: Record<MediaCategory, string> = {
  traffic: 'Traffic',
  road_safety: 'Road Safety',
  crime_prevention: 'Crime Prevention',
  public_announcements: 'Announcements',
  community_policing: 'Community',
  general: 'General',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function ArticleCard({ item, onPress }: ArticleCardProps) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const icon = CATEGORY_ICON[item.category] ?? 'newspaper';
  const catLabel = CATEGORY_LABEL[item.category] ?? item.category;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={item.title}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        <View style={styles.catBadge}>
          <Ionicons name={icon as any} size={11} color={colors.brand} />
          <Text style={styles.catText}>{catLabel}</Text>
        </View>
        {item.publishedAt && (
          <Text style={styles.date}>{formatDate(item.publishedAt)}</Text>
        )}
      </View>
      <Text style={styles.title} numberOfLines={3}>{item.title}</Text>
      <Text style={styles.summary} numberOfLines={2}>{item.summary}</Text>
      <View style={styles.bottom}>
        <Text style={styles.author} numberOfLines={1}>{item.author}</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.textFaint} />
      </View>
    </Pressable>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      gap: spacing.xs,
      minHeight: HIT_SIZE,
    },
    pressed: { opacity: 0.75 },
    top: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    catBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.brandSoft,
      borderRadius: radius.pill,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    catText: {
      ...sans.tiny,
      color: colors.brand,
      letterSpacing: 0.3,
    },
    date: {
      ...sans.tiny,
      color: colors.textFaint,
    },
    title: {
      ...sans.label,
      color: colors.text,
      lineHeight: 20,
    },
    summary: {
      ...sans.small,
      color: colors.textMuted,
    },
    bottom: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 2,
    },
    author: {
      ...sans.tiny,
      color: colors.textFaint,
      flex: 1,
      marginRight: spacing.xs,
    },
  });
