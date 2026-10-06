/**
 * Admin › Content Management › News & Articles
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
import type { PublishStatus } from '@/types';

type StatusFilter = 'all' | PublishStatus;

const STATUS_COLORS: Record<PublishStatus, string> = {
  draft: '#64748B',
  review: '#D97706',
  approved: '#1A56DB',
  published: '#15803D',
  archived: '#94A3B8',
};

export default function AdminNewsScreen() {
  const t = useT();
  const { articles } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filtered = articles.filter((a) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.author.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const chips: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'draft', label: t('admin.draft_status') },
    { value: 'review', label: t('admin.review_status') },
    { value: 'approved', label: t('admin.approved_status') },
    { value: 'published', label: t('admin.published_status') },
    { value: 'archived', label: t('admin.archived_status') },
  ];

  return (
    <Screen>
      <TopBar title={t('admin.content.news')} />

      <View style={styles.actionBar}>
        <SearchBar value={query} onChangeText={setQuery} placeholder={t('admin.search')} />
        <Pressable onPress={() => {}} style={({ pressed }) => [styles.createBtn, pressed && styles.pressed]}>
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={styles.createBtnText}>{t('admin.create')}</Text>
        </Pressable>
      </View>

      <FilterChips chips={chips} selected={statusFilter} onSelect={setStatusFilter} />

      <Text style={styles.summary}>
        {filtered.length} articles · {articles.filter((a) => a.status === 'published').length} published
      </Text>

      <View style={styles.list}>
        {filtered.map((article) => {
          const statusColor = STATUS_COLORS[article.status];
          const date = article.publishedAt
            ? new Date(article.publishedAt).toLocaleDateString('en-RW', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'Not published';

          return (
            <View key={article.id} style={styles.row}>
              <View style={styles.rowBody}>
                <View style={styles.rowHeader}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                  <Text style={[styles.statusLabel, { color: statusColor }]}>
                    {article.status.toUpperCase()}
                  </Text>
                  <Text style={styles.category}>{article.category.replace('_', ' ')}</Text>
                </View>
                <Text style={styles.rowTitle} numberOfLines={2}>{article.title}</Text>
                <Text style={styles.rowMeta}>{article.author} · {date}</Text>
                {article.tags.length > 0 && (
                  <View style={styles.tagRow}>
                    {article.tags.slice(0, 3).map((tag) => (
                      <Text key={tag} style={styles.tag}>#{tag}</Text>
                    ))}
                  </View>
                )}
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => {}} style={styles.actionBtn}>
                  <Ionicons name="create-outline" size={16} color={colors.brand} />
                </Pressable>
                <Pressable onPress={() => {}} style={styles.actionBtn}>
                  <Ionicons
                    name={article.status === 'published' ? 'eye-off-outline' : 'eye-outline'}
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
      padding: spacing.md,
      gap: spacing.sm,
      ...shadow.card,
    },
    rowBody: { flex: 1, gap: spacing.xs },
    rowHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusLabel: { ...sans.tiny, fontSize: 10, fontFamily: 'Manrope_800ExtraBold' },
    category: {
      ...sans.tiny,
      color: colors.textFaint,
      backgroundColor: colors.sage,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 1,
    },
    rowTitle: { ...sans.label, color: colors.text, fontSize: 13, lineHeight: 19 },
    rowMeta: { ...sans.tiny, color: colors.textMuted },
    tagRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
    tag: { ...sans.tiny, color: colors.brand, fontSize: 10 },
    actions: { gap: spacing.xs, justifyContent: 'center' },
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
