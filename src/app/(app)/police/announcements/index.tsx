import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AnnouncementCard } from '@/components/AnnouncementCard';
import { FilterChips, type FilterChip } from '@/components/FilterChips';
import { SearchBar } from '@/components/SearchBar';
import { Screen } from '@/components/Screen';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import type { AnnouncementType } from '@/types';
import { sans, serif, spacing, useTheme, type Colors } from '@/theme';

type Filter = 'all' | AnnouncementType;

export default function AnnouncementsScreen() {
  const { colors } = useTheme();
  const t = useT();
  const { searchAnnouncements } = useApp();
  const styles = makeStyles(colors);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const chips: FilterChip<Filter>[] = [
    { value: 'all', label: t('announcements.filterAll') },
    { value: 'urgent', label: t('announcements.urgent') },
    { value: 'press_release', label: t('announcements.filterPress') },
    { value: 'road_closure', label: t('announcements.filterRoad') },
    { value: 'public_safety', label: t('announcements.filterSafety') },
    { value: 'event_notice', label: t('announcements.filterEvent') },
  ];

  const results = searchAnnouncements(query, filter === 'all' ? undefined : filter);

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="megaphone" size={22} color={colors.brand} />
          <Text style={styles.title}>{t('announcements.title')}</Text>
        </View>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={t('announcements.search')}
        />
        <FilterChips chips={chips} selected={filter} onSelect={setFilter} />
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyWrap}>
            <Ionicons name="search" size={40} color={colors.textFaint} />
            <Text style={styles.emptyText}>{t('announcements.noResults')}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <AnnouncementCard
            item={item}
            onPress={() => router.push(`/police/announcements/${item.id}` as any)}
          />
        )}
      />
    </Screen>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    header: {
      gap: spacing.sm,
      paddingHorizontal: spacing.gutter,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    title: { ...serif.h2, color: colors.brand },
    list: {
      paddingHorizontal: spacing.gutter,
      paddingBottom: spacing.xl,
    },
    sep: { height: spacing.sm },
    emptyWrap: {
      alignItems: 'center',
      paddingTop: spacing.xxl,
      gap: spacing.sm,
    },
    emptyText: { ...sans.body, color: colors.textMuted, textAlign: 'center' },
  });
