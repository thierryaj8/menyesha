import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { FilterChips, type FilterChip } from '@/components/FilterChips';
import { SearchBar } from '@/components/SearchBar';
import { Screen } from '@/components/Screen';
import { TrafficDocCard } from '@/components/TrafficDocCard';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import type { TrafficDocCategory } from '@/types';
import { sans, serif, spacing, useTheme, type Colors } from '@/theme';

type Filter = 'all' | TrafficDocCategory;

export default function TrafficScreen() {
  const { colors } = useTheme();
  const t = useT();
  const { searchTrafficDocs } = useApp();
  const styles = makeStyles(colors);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const chips: FilterChip<Filter>[] = [
    { value: 'all', label: t('traffic.filterAll') },
    { value: 'driving_licences', label: t('traffic.filterLicences') },
    { value: 'road_signs', label: t('traffic.filterSigns') },
    { value: 'vehicle_regulations', label: t('traffic.filterVehicles') },
    { value: 'pedestrian_safety', label: t('traffic.filterPedestrian') },
    { value: 'public_transport', label: t('traffic.filterTransport') },
    { value: 'traffic_offences', label: t('traffic.filterOffences') },
  ];

  const results = searchTrafficDocs(query, filter === 'all' ? undefined : filter);

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="car" size={22} color={colors.brand} />
          <Text style={styles.title}>{t('traffic.title')}</Text>
        </View>
        <SearchBar value={query} onChangeText={setQuery} placeholder={t('traffic.search')} />
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
            <Text style={styles.emptyText}>{t('traffic.noResults')}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TrafficDocCard
            item={item}
            onPress={() => router.push(`/police/traffic/${item.id}` as any)}
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
