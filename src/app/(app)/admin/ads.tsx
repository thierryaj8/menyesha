/**
 * Admin › Advertisements list
 */
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { FilterChips } from '@/components/FilterChips';
import { TopBar } from '@/components/TopBar';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { radius, sans, shadow, spacing, useTheme, type Colors } from '@/theme';
import { useState } from 'react';
import type { AdStatus } from '@/types';

type StatusFilter = 'all' | AdStatus;

const STATUS_COLORS: Record<AdStatus, string> = {
  draft: '#64748B',
  scheduled: '#1A56DB',
  active: '#15803D',
  paused: '#D97706',
  ended: '#94A3B8',
  archived: '#94A3B8',
};

export default function AdminAdsScreen() {
  const t = useT();
  const { advertisements } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filtered = advertisements.filter((ad) => {
    const q = query.toLowerCase();
    const matchesQuery = !q || ad.title.toLowerCase().includes(q) || ad.campaignName.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || ad.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const chips: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: t('admin.active') },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'draft', label: t('admin.draft_status') },
    { value: 'paused', label: 'Paused' },
    { value: 'ended', label: 'Ended' },
  ];

  return (
    <Screen>
      <TopBar title={t('admin.ads.list')} />

      <View style={styles.actionBar}>
        <SearchBar value={query} onChangeText={setQuery} placeholder={t('admin.search')} />
        <Pressable onPress={() => {}} style={({ pressed }) => [styles.createBtn, pressed && styles.pressed]}>
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={styles.createBtnText}>{t('admin.ads.newAd')}</Text>
        </Pressable>
      </View>

      <FilterChips chips={chips} selected={statusFilter} onSelect={setStatusFilter} />
      <Text style={styles.summary}>{filtered.length} ads</Text>

      <View style={styles.list}>
        {filtered.map((ad) => {
          const statusColor = STATUS_COLORS[ad.status];
          const ctr = ad.impressions > 0
            ? ((ad.clicks / ad.impressions) * 100).toFixed(1)
            : '0.0';
          const start = new Date(ad.startDate).toLocaleDateString('en-RW', { month: 'short', day: 'numeric' });
          const end = new Date(ad.endDate).toLocaleDateString('en-RW', { month: 'short', day: 'numeric', year: 'numeric' });

          return (
            <View key={ad.id} style={styles.row}>
              <View style={styles.rowBody}>
                <View style={styles.rowHeader}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                  <Text style={[styles.statusLabel, { color: statusColor }]}>
                    {ad.status.toUpperCase()}
                  </Text>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{ad.adType}</Text>
                  </View>
                </View>
                <Text style={styles.adTitle} numberOfLines={1}>{ad.title}</Text>
                <Text style={styles.campaign}>{ad.campaignName}</Text>
                <Text style={styles.dates}>{start} → {end} · {ad.targetPage}</Text>
                <View style={styles.statsRow}>
                  <StatPill label={t('admin.ads.impressions')} value={ad.impressions.toLocaleString()} colors={colors} />
                  <StatPill label={t('admin.ads.clicks')} value={ad.clicks.toLocaleString()} colors={colors} />
                  <StatPill label={t('admin.ads.ctr')} value={`${ctr}%`} colors={colors} />
                </View>
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => {}} style={styles.actionBtn}>
                  <Ionicons name="create-outline" size={16} color={colors.brand} />
                </Pressable>
                <Pressable onPress={() => {}} style={styles.actionBtn}>
                  <Ionicons
                    name={ad.status === 'active' ? 'pause-circle-outline' : 'play-circle-outline'}
                    size={16}
                    color={colors.textMuted}
                  />
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

function StatPill({ label, value, colors }: { label: string; value: string; colors: Colors }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 12, color: colors.text }}>{value}</Text>
      <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 10, color: colors.textFaint }}>{label}</Text>
    </View>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    actionBar: {
      flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm, alignItems: 'center',
    },
    createBtn: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
      backgroundColor: colors.brand, borderRadius: radius.md,
      paddingVertical: spacing.sm, paddingHorizontal: spacing.md, flexShrink: 0,
    },
    createBtnText: { ...sans.label, color: colors.white, fontSize: 12 },
    summary: { ...sans.tiny, color: colors.textMuted, marginVertical: spacing.sm },
    list: { gap: spacing.sm },
    row: {
      flexDirection: 'row', backgroundColor: colors.surface,
      borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
      padding: spacing.md, gap: spacing.sm, ...shadow.card,
    },
    rowBody: { flex: 1, gap: spacing.xs },
    rowHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusLabel: { ...sans.tiny, fontSize: 10, fontFamily: 'Manrope_800ExtraBold' },
    typeBadge: {
      backgroundColor: colors.sage, borderRadius: radius.pill,
      paddingHorizontal: spacing.sm, paddingVertical: 2,
    },
    typeText: { ...sans.tiny, color: colors.textMuted, fontSize: 10 },
    adTitle: { ...sans.label, color: colors.text, fontSize: 13 },
    campaign: { ...sans.tiny, color: colors.accent },
    dates: { ...sans.tiny, color: colors.textMuted },
    statsRow: {
      flexDirection: 'row', gap: spacing.md,
      borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.xs,
    },
    actions: { gap: spacing.xs, justifyContent: 'center' },
    actionBtn: {
      width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
      borderRadius: radius.sm, backgroundColor: colors.sage,
    },
    pressed: { opacity: 0.8 },
  });
