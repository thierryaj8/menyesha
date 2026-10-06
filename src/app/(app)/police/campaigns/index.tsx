import { Ionicons } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { radius, sans, serif, spacing, useTheme, type Colors } from '@/theme';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function CampaignsScreen() {
  const { colors } = useTheme();
  const t = useT();
  const { campaigns } = useApp();
  const styles = makeStyles(colors);

  const active = campaigns.filter((c) => c.isActive);
  const archive = campaigns.filter((c) => !c.isActive);

  return (
    <Screen>
      {/* Header */}
      <View style={styles.titleRow}>
        <Ionicons name="flag" size={22} color={colors.brand} />
        <Text style={styles.title}>{t('campaigns.title')}</Text>
      </View>

      {/* Active campaigns */}
      <Text style={styles.sectionLabel}>{t('campaigns.active')}</Text>
      {active.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>{t('campaigns.noActive')}</Text>
        </View>
      ) : (
        <FlatList
          data={active}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/police/campaigns/${item.id}` as any)}
              accessibilityRole="button"
              accessibilityLabel={item.title}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              {/* Official badge */}
              <View style={styles.badgeRow}>
                <View style={styles.officialBadge}>
                  <Ionicons name="shield-checkmark" size={11} color={colors.gold} />
                  <Text style={styles.officialText}>{t('campaigns.officialLabel').toUpperCase()}</Text>
                </View>
                <View style={styles.topicBadge}>
                  <Text style={styles.topicText}>{item.topic}</Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
              <View style={styles.cardMeta}>
                <Text style={styles.metaText}>
                  {t('campaigns.endsOn')} {formatDate(item.endsAt)}
                </Text>
                <Text style={styles.engText}>
                  {t('campaigns.engagement', {
                    views: item.views.toLocaleString(),
                    clicks: item.clicks.toLocaleString(),
                  })}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}

      {/* Archive */}
      {archive.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>{t('campaigns.archive')}</Text>
          <FlatList
            data={archive}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => router.push(`/police/campaigns/${item.id}` as any)}
                style={({ pressed }) => [styles.card, styles.archiveCard, pressed && styles.pressed]}
              >
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.metaText}>
                  {formatDate(item.startsAt)} — {formatDate(item.endsAt)}
                </Text>
              </Pressable>
            )}
          />
        </>
      )}
    </Screen>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    title: { ...serif.h2, color: colors.brand },
    sectionLabel: { ...sans.eyebrow, color: colors.textMuted },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      gap: spacing.xs,
    },
    archiveCard: { backgroundColor: colors.sage, borderColor: 'transparent' },
    pressed: { opacity: 0.8 },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      flexWrap: 'wrap',
    },
    officialBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.brand,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
    },
    officialText: { ...sans.tiny, color: colors.gold, letterSpacing: 0.8 },
    topicBadge: {
      backgroundColor: colors.goldSoft,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
    },
    topicText: { ...sans.tiny, color: colors.gold },
    cardTitle: { ...sans.label, color: colors.text },
    cardDesc: { ...sans.small, color: colors.textMuted },
    cardMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    metaText: { ...sans.tiny, color: colors.textFaint },
    engText: { ...sans.tiny, color: colors.textFaint },
    emptyWrap: { padding: spacing.lg, alignItems: 'center' },
    emptyText: { ...sans.body, color: colors.textMuted },
  });
