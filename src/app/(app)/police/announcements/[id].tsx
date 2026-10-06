import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { radius, sans, serif, spacing, useTheme, type Colors } from '@/theme';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function AnnouncementDetailScreen() {
  const { colors } = useTheme();
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getAnnouncement } = useApp();
  const styles = makeStyles(colors);

  const item = getAnnouncement(id ?? '');

  if (!item) {
    return (
      <Screen>
        <Text style={styles.notFound}>{t('detail.notFound')}</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      {/* Back */}
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        style={styles.back}
      >
        <Ionicons name="arrow-back" size={22} color={colors.brand} />
        <Text style={styles.backText}>{t('common.back')}</Text>
      </Pressable>

      {/* Urgent badge */}
      {item.isUrgent && (
        <View style={styles.urgentBanner}>
          <Ionicons name="alert-circle" size={18} color={colors.white} />
          <Text style={styles.urgentText}>{t('announcements.urgent')}</Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.meta}>
        <Text style={styles.authority}>{item.authority}</Text>
        <Text style={styles.date}>{formatDate(item.publishedAt)}</Text>
      </View>

      <Text style={styles.headline}>{item.headline}</Text>
      <Text style={styles.body}>{item.body}</Text>

      {/* Locations */}
      {item.locations && item.locations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('announcements.relatedLocations')}</Text>
          <View style={styles.tagRow}>
            {item.locations.map((loc) => (
              <View key={loc} style={styles.tag}>
                <Ionicons name="location-outline" size={12} color={colors.brand} />
                <Text style={styles.tagText}>{loc}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Source link */}
      {item.sourceUrl && (
        <Pressable
          onPress={() => Linking.openURL(item.sourceUrl!).catch(() => undefined)}
          accessibilityRole="link"
          style={({ pressed }) => [styles.sourceBtn, pressed && styles.pressed]}
        >
          <Ionicons name="open-outline" size={16} color={colors.accent} />
          <Text style={styles.sourceBtnText}>{t('announcements.viewSource')}</Text>
        </Pressable>
      )}

      {/* Push notification note */}
      <View style={styles.pushNote}>
        <Ionicons name="notifications-outline" size={16} color={colors.textFaint} />
        <Text style={styles.pushText}>{t('announcements.pushNote')}</Text>
      </View>
    </Screen>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    back: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },
    backText: { ...sans.label, color: colors.brand },
    urgentBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.emergency,
      borderRadius: radius.md,
      padding: spacing.sm,
    },
    urgentText: { ...sans.label, color: colors.white },
    meta: { gap: 2 },
    authority: { ...sans.label, color: colors.brand },
    date: { ...sans.small, color: colors.textMuted },
    headline: { ...serif.h2, color: colors.text },
    body: { ...sans.body, color: colors.text, lineHeight: 26 },
    section: { gap: spacing.xs },
    sectionTitle: { ...sans.label, color: colors.textMuted },
    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.brandSoft,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },
    tagText: { ...sans.small, color: colors.brand },
    sourceBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      alignSelf: 'flex-start',
      backgroundColor: colors.accentSoft,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    pressed: { opacity: 0.75 },
    sourceBtnText: { ...sans.label, color: colors.accent },
    pushNote: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.xs,
      backgroundColor: colors.sage,
      borderRadius: radius.md,
      padding: spacing.sm,
    },
    pushText: { ...sans.small, color: colors.textMuted, flex: 1 },
    notFound: { ...sans.body, color: colors.textMuted, textAlign: 'center' },
  });
