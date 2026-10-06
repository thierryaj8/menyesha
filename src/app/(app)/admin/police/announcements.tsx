/**
 * Admin › Police Management › Announcements
 * Create, edit, publish/unpublish, archive official police announcements.
 */
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { TopBar } from '@/components/TopBar';
import { FilterChips } from '@/components/FilterChips';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { radius, sans, shadow, spacing, useTheme, type Colors } from '@/theme';
import { useState } from 'react';
import type { AnnouncementType } from '@/types';

type Filter = 'all' | AnnouncementType;

const TYPE_COLORS: Record<AnnouncementType, string> = {
  urgent: '#B91C1C',
  public_safety: '#D97706',
  road_closure: '#1A56DB',
  press_release: '#0A1F44',
  event_notice: '#7C3AED',
};

export default function AdminAnnouncementsScreen() {
  const t = useT();
  const { searchAnnouncements } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = searchAnnouncements(
    query,
    filter === 'all' ? undefined : filter,
  );

  const chips = [
    { value: 'all' as Filter, label: 'All' },
    { value: 'urgent' as Filter, label: t('announcements.filterAll') },
    { value: 'press_release' as Filter, label: t('announcements.filterPress') },
    { value: 'road_closure' as Filter, label: t('announcements.filterRoad') },
    { value: 'public_safety' as Filter, label: t('announcements.filterSafety') },
    { value: 'event_notice' as Filter, label: t('announcements.filterEvent') },
  ];

  return (
    <Screen>
      <TopBar title={t('admin.police.announcements')} />

      <View style={styles.actionBar}>
        <SearchBar value={query} onChangeText={setQuery} placeholder={t('admin.search')} />
        <Pressable
          onPress={() => {}}
          style={({ pressed }) => [styles.createBtn, pressed && styles.pressed]}
        >
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={styles.createBtnText}>{t('admin.create')}</Text>
        </Pressable>
      </View>

      <FilterChips chips={chips} selected={filter} onSelect={setFilter} />

      <Text style={styles.summary}>
        {filtered.length} {t('admin.stat.announcements').toLowerCase()}
      </Text>

      <View style={styles.list}>
        {filtered.map((ann) => {
          const typeColor = TYPE_COLORS[ann.type] ?? colors.brand;
          const date = new Date(ann.publishedAt).toLocaleDateString('en-RW', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });

          return (
            <View key={ann.id} style={styles.row}>
              <View style={[styles.typeStripe, { backgroundColor: typeColor }]} />
              <View style={styles.rowBody}>
                <View style={styles.rowHeader}>
                  {ann.isUrgent && (
                    <View style={styles.urgentBadge}>
                      <Text style={styles.urgentText}>{t('announcements.urgent')}</Text>
                    </View>
                  )}
                  <View style={[styles.typeBadge, { borderColor: typeColor }]}>
                    <Text style={[styles.typeText, { color: typeColor }]}>
                      {ann.type.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.headline} numberOfLines={2}>{ann.headline}</Text>
                <Text style={styles.meta}>{ann.authority} · {date}</Text>
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => {}} style={styles.actionBtn}>
                  <Ionicons name="create-outline" size={16} color={colors.brand} />
                </Pressable>
                <Pressable onPress={() => {}} style={styles.actionBtn}>
                  <Ionicons name="ellipsis-vertical" size={16} color={colors.textMuted} />
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    actionBar: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.sm,
      alignItems: 'center',
    },
    createBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.brand,
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      flexShrink: 0,
    },
    createBtnText: { ...sans.label, color: colors.white, fontSize: 13 },
    summary: { ...sans.tiny, color: colors.textMuted, marginVertical: spacing.sm },
    list: { gap: spacing.sm },
    row: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      ...shadow.card,
    },
    typeStripe: { width: 4 },
    rowBody: { flex: 1, padding: spacing.md, gap: spacing.xs },
    rowHeader: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center', flexWrap: 'wrap' },
    urgentBadge: {
      backgroundColor: '#FEE2E2',
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    urgentText: {
      fontFamily: 'Manrope_800ExtraBold',
      fontSize: 9,
      color: '#B91C1C',
      letterSpacing: 0.5,
    },
    typeBadge: {
      borderWidth: 1,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    typeText: { ...sans.tiny, fontSize: 9 },
    headline: { ...sans.label, color: colors.text, fontSize: 13, lineHeight: 19 },
    meta: { ...sans.tiny, color: colors.textMuted },
    actions: {
      padding: spacing.sm,
      gap: spacing.xs,
      justifyContent: 'center',
    },
    actionBtn: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.sm,
      backgroundColor: colors.sage,
    },
    pressed: { opacity: 0.8 },
  });
