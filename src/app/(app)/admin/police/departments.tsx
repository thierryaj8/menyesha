/**
 * Admin › Police Management › Departments
 * Lists all departments with status indicators.
 * Each row shows edit / verify / deactivate actions (mock).
 */
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { TopBar } from '@/components/TopBar';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { radius, sans, shadow, spacing, useTheme, type Colors } from '@/theme';
import { useState } from 'react';

export default function AdminDepartmentsScreen() {
  const t = useT();
  const { departments } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [query, setQuery] = useState('');

  const filtered = departments.filter((d) => {
    const q = query.toLowerCase();
    return !q || d.name.toLowerCase().includes(q) || d.location.toLowerCase().includes(q);
  });

  return (
    <Screen>
      <TopBar title={t('admin.police.departments')} />

      {/* Action bar */}
      <View style={styles.actionBar}>
        <SearchBar value={query} onChangeText={setQuery} placeholder={t('admin.search')} />
        <Pressable
          onPress={() => {}}
          accessibilityRole="button"
          style={({ pressed }) => [styles.createBtn, pressed && styles.pressed]}
        >
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={styles.createBtnText}>{t('admin.create')}</Text>
        </Pressable>
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}>
          {filtered.length} {t('admin.stat.departments').toLowerCase()} ·{' '}
          {departments.filter((d) => d.isVerified).length} verified
        </Text>
      </View>

      {/* List */}
      <View style={styles.list}>
        {filtered.map((dept) => (
          <View key={dept.id} style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons name="shield-checkmark" size={20} color={colors.white} />
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowName} numberOfLines={1}>{dept.name}</Text>
              <Text style={styles.rowMeta}>{dept.location} · {dept.type}</Text>
            </View>
            <View style={styles.badges}>
              {dept.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={11} color={colors.gold} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
              <View style={[styles.statusBadge, dept.isActive ? styles.activeBadge : styles.inactiveBadge]}>
                <Text style={[styles.statusText, dept.isActive ? styles.activeText : styles.inactiveText]}>
                  {dept.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => {}}
              accessibilityRole="button"
              accessibilityLabel={t('admin.edit')}
              style={styles.actionBtn}
            >
              <Ionicons name="create-outline" size={18} color={colors.brand} />
            </Pressable>
          </View>
        ))}
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
    summaryRow: { marginBottom: spacing.sm },
    summaryText: { ...sans.tiny, color: colors.textMuted },
    list: { gap: spacing.sm },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      ...shadow.card,
    },
    rowIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.sm,
      backgroundColor: colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    rowBody: { flex: 1, gap: 2 },
    rowName: { ...sans.label, color: colors.text, fontSize: 13 },
    rowMeta: { ...sans.tiny, color: colors.textMuted },
    badges: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center', flexWrap: 'wrap' },
    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: colors.goldSoft,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    verifiedText: { ...sans.tiny, color: colors.gold, fontSize: 10 },
    statusBadge: {
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    activeBadge: { backgroundColor: colors.successSoft },
    inactiveBadge: { backgroundColor: colors.neutralSoft },
    statusText: { ...sans.tiny, fontSize: 10 },
    activeText: { color: colors.success },
    inactiveText: { color: colors.neutralText },
    actionBtn: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.sm,
      backgroundColor: colors.brandSoft,
    },
    pressed: { opacity: 0.8 },
  });
