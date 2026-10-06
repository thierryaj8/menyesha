import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ArticleCard } from '@/components/ArticleCard';
import { FilterChips, type FilterChip } from '@/components/FilterChips';
import { SearchBar } from '@/components/SearchBar';
import { Screen } from '@/components/Screen';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import type { MediaCategory } from '@/types';
import { sans, serif, spacing, useTheme, type Colors } from '@/theme';

type Filter = 'all' | MediaCategory;

export default function MediaScreen() {
  const { colors } = useTheme();
  const t = useT();
  const { searchArticles } = useApp();
  const styles = makeStyles(colors);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const chips: FilterChip<Filter>[] = [
    { value: 'all', label: t('media.filterAll') },
    { value: 'traffic', label: t('media.filterTraffic') },
    { value: 'road_safety', label: t('media.filterRoadSafety') },
    { value: 'crime_prevention', label: t('media.filterCrime') },
    { value: 'public_announcements', label: t('media.filterAnnouncements') },
    { value: 'community_policing', label: t('media.filterCommunity') },
    { value: 'general', label: t('media.filterGeneral') },
  ];

  const results = searchArticles(query, filter === 'all' ? undefined : filter);

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="newspaper" size={22} color={colors.brand} />
          <Text style={styles.title}>{t('media.title')}</Text>
        </View>
        <SearchBar value={query} onChangeText={setQuery} placeholder={t('media.search')} />
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
            <Text style={styles.emptyText}>{t('media.noResults')}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <ArticleCard
            item={item}
            onPress={() => router.push(`/police/media/${item.id}` as any)}
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
