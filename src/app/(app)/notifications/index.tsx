/**
 * Citizen notifications.
 *
 * Sources are the same official records the Discover area publishes, so urgent
 * announcements, report status changes, points awards and new documents all
 * land in one feed. Tapping a row marks it read and opens the source.
 */
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { FilterChips, type FilterChip } from '@/components/FilterChips';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import type { AppNotification, NotificationKind } from '@/types';
import {
  HIT_SIZE,
  fonts,
  radius,
  sans,
  serif,
  shadow,
  spacing,
  useTheme,
  type Colors,
} from '@/theme';
import { formatWhen } from '@/utils/format';

type Filter = 'all' | NotificationKind;

const KIND_ICONS: Record<NotificationKind, string> = {
  announcement: 'megaphone',
  report_status: 'file-tray-full',
  points: 'trophy',
  campaign: 'flag',
  newsletter: 'mail',
  traffic_doc: 'document-text',
};

export default function NotificationsScreen() {
  const t = useT();
  const {
    unreadCount,
    searchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const results = searchNotifications(query, filter === 'all' ? undefined : filter);

  const chips: FilterChip<Filter>[] = [
    { value: 'all', label: t('notifications.filterAll') },
    { value: 'announcement', label: t('notifications.kind.announcement') },
    { value: 'report_status', label: t('notifications.kind.report_status') },
    { value: 'points', label: t('notifications.kind.points') },
    { value: 'campaign', label: t('notifications.kind.campaign') },
    { value: 'traffic_doc', label: t('notifications.kind.traffic_doc') },
    { value: 'newsletter', label: t('notifications.kind.newsletter') },
  ];

  function open(item: AppNotification) {
    markNotificationRead(item.id);
    if (item.route) router.push(item.route as any);
  }

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="notifications" size={22} color={colors.brand} />
          <Text style={styles.title}>{t('notifications.title')}</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.subtitle}>{t('notifications.subtitle')}</Text>
      </View>

      <SearchBar value={query} onChangeText={setQuery} placeholder={t('notifications.search')} />

      <View style={styles.filterRow}>
        <FilterChips chips={chips} selected={filter} onSelect={setFilter} />
      </View>

      {unreadCount > 0 && (
        <Pressable
          onPress={markAllNotificationsRead}
          accessibilityRole="button"
          style={({ pressed }) => [styles.markAll, pressed && styles.pressed]}
        >
          <Ionicons name="checkmark-done" size={16} color={colors.brandForeground} />
          <Text style={styles.markAllText}>{t('notifications.markAllRead')}</Text>
        </Pressable>
      )}

      {results.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="notifications-off-outline" size={40} color={colors.textFaint} />
          <Text style={styles.emptyText}>{t('notifications.noResults')}</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {results.map((item) => (
            <NotificationRow
              key={item.id}
              item={item}
              onPress={() => open(item)}
              colors={colors}
              styles={styles}
              t={t}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

function NotificationRow({
  item,
  onPress,
  colors,
  styles,
  t,
}: {
  item: AppNotification;
  onPress: () => void;
  colors: Colors;
  styles: ReturnType<typeof makeStyles>;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const unread = !item.isRead;
  const tint = item.isUrgent ? colors.emergency : colors.accent;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={item.title}
      style={({ pressed }) => [
        styles.row,
        unread && styles.rowUnread,
        item.isUrgent && styles.rowUrgent,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.kindIcon, { backgroundColor: unread ? tint : colors.brandSoft }]}>
        <Ionicons
          name={KIND_ICONS[item.kind] as any}
          size={18}
          color={unread ? colors.white : colors.brand}
        />
      </View>

      <View style={styles.rowBody}>
        <View style={styles.rowHead}>
          <Text style={[styles.rowTitle, unread && styles.rowTitleUnread]} numberOfLines={2}>
            {item.title}
          </Text>
          {item.isUrgent && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>{t('notifications.urgent')}</Text>
            </View>
          )}
        </View>
        <Text style={styles.rowBodyText} numberOfLines={2}>
          {item.body}
        </Text>
        <Text style={styles.rowMeta}>
          {t(`notifications.kind.${item.kind}` as any)} · {formatWhen(item.createdAt)}
        </Text>
      </View>

      {unread && <View style={styles.unreadDot} />}
    </Pressable>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    header: { gap: spacing.xs },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    title: { ...serif.h2, color: colors.brand, flex: 1 },
    unreadBadge: {
      backgroundColor: colors.emergency,
      borderRadius: radius.pill,
      minWidth: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
    },
    unreadText: { ...sans.tiny, color: colors.white },
    subtitle: { ...sans.small, color: colors.textMuted },
    filterRow: { marginTop: -spacing.sm },
    markAll: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      alignSelf: 'flex-start',
      backgroundColor: colors.brandSoft,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      minHeight: 36,
      justifyContent: 'center',
    },
    markAllText: { ...sans.tiny, color: colors.brandForeground },
    list: { gap: spacing.sm },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      minHeight: HIT_SIZE,
      ...shadow.card,
    },
    rowUnread: { borderColor: colors.borderStrong },
    rowUrgent: { backgroundColor: colors.emergencySoft, borderColor: colors.emergency },
    kindIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    rowBody: { flex: 1, gap: 3 },
    rowHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
    rowTitle: { ...sans.label, color: colors.text, flex: 1, fontSize: 13, lineHeight: 19 },
    rowTitleUnread: { color: colors.brand },
    rowBodyText: { ...sans.small, color: colors.textMuted },
    rowMeta: { ...sans.tiny, color: colors.textFaint },
    urgentBadge: {
      backgroundColor: colors.emergency,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    urgentText: { fontFamily: fonts.sansSemiBold, fontSize: 9, color: colors.white, letterSpacing: 0.5 },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.accent,
      marginTop: spacing.xs,
    },
    emptyWrap: { alignItems: 'center', paddingTop: spacing.xxl, gap: spacing.sm },
    emptyText: { ...sans.body, color: colors.textMuted, textAlign: 'center' },
    pressed: { opacity: 0.85 },
  });