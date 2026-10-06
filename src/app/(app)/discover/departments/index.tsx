/**
 * Discover › Departments — list of all verified police departments.
 */
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { FilterChips } from '@/components/FilterChips';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { TopBar } from '@/components/TopBar';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { radius, sans, shadow, spacing, useTheme, type Colors } from '@/theme';
import { useState } from 'react';
import type { PoliceDepartment } from '@/types';

type DeptFilter = 'all' | 'national' | 'traffic' | 'community' | 'regional' | 'specialized';

export default function DepartmentsScreen() {
  const t = useT();
  const { departments } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<DeptFilter>('all');

  const filtered = departments
    .filter((d) => d.isActive && d.isVerified)
    .filter((d) => (filter === 'all' ? true : d.type === filter))
    .filter((d) => {
      const q = query.toLowerCase().trim();
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.shortName.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q)
      );
    });

  const chips = [
    { value: 'all' as DeptFilter, label: 'All' },
    { value: 'national' as DeptFilter, label: t('departments.type.national') },
    { value: 'traffic' as DeptFilter, label: t('departments.type.traffic') },
    { value: 'community' as DeptFilter, label: t('departments.type.community') },
    { value: 'regional' as DeptFilter, label: t('departments.type.regional') },
    { value: 'specialized' as DeptFilter, label: t('departments.type.specialized') },
  ];

  return (
    <Screen>
      <TopBar title={t('departments.title')} />
      <Text style={styles.subtitle}>{t('departments.subtitle')}</Text>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder={t('departments.search')}
        mb={spacing.sm}
      />

      <FilterChips chips={chips} selected={filter} onSelect={setFilter} />

      <View style={styles.list}>
        {filtered.length === 0 ? (
          <Text style={styles.empty}>{t('departments.noResults')}</Text>
        ) : (
          filtered.map((dept) => (
            <DepartmentCard
              key={dept.id}
              dept={dept}
              onPress={() => router.push(`/discover/departments/${dept.id}` as any)}
              colors={colors}
              styles={styles}
              t={t}
            />
          ))
        )}
      </View>
    </Screen>
  );
}

function DepartmentCard({
  dept,
  onPress,
  colors,
  styles,
  t,
}: {
  dept: PoliceDepartment;
  onPress: () => void;
  colors: Colors;
  styles: ReturnType<typeof makeStyles>;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={dept.name}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.cardIcon}>
        <Ionicons name="shield-checkmark" size={26} color={colors.white} />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>{dept.name}</Text>
          {dept.isVerified && (
            <View style={styles.badge}>
              <Ionicons name="checkmark-circle" size={12} color={colors.gold} />
              <Text style={styles.badgeText}>{t('departments.verified')}</Text>
            </View>
          )}
        </View>
        <Text style={styles.cardLocation}>
          <Ionicons name="location-outline" size={12} color={colors.textMuted} /> {dept.location}
        </Text>
        <View style={styles.statsRow}>
          <StatPill icon="newspaper-outline" count={dept.postCount} label={t('departments.posts')} colors={colors} />
          <StatPill icon="play-circle-outline" count={dept.videoCount} label={t('departments.videos')} colors={colors} />
          <StatPill icon="images-outline" count={dept.photoCount} label={t('departments.photos')} colors={colors} />
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
    </Pressable>
  );
}

function StatPill({ icon, count, label, colors }: { icon: string; count: number; label: string; colors: Colors }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
      <Ionicons name={icon as any} size={11} color={colors.textFaint} />
      <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 11, color: colors.textFaint }}>
        {count} {label}
      </Text>
    </View>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    subtitle: { ...sans.small, color: colors.textMuted, marginBottom: spacing.md },
    list: { gap: spacing.sm, marginTop: spacing.md },
    empty: { ...sans.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      ...shadow.card,
    },
    pressed: { opacity: 0.85 },
    cardIcon: {
      width: 52,
      height: 52,
      borderRadius: radius.md,
      backgroundColor: colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    cardBody: { flex: 1, gap: spacing.xs },
    cardTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      flexWrap: 'wrap',
    },
    cardTitle: { ...sans.label, color: colors.text, flex: 1 },
    cardLocation: { ...sans.tiny, color: colors.textMuted },
    statsRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: colors.goldSoft,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    badgeText: { ...sans.tiny, color: colors.gold },
  });
