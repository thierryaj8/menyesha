/**
 * Admin › Police Management › Police Accounts
 * Manage official police communication accounts (admin users).
 */
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { TopBar } from '@/components/TopBar';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { ROLE_LABELS } from '@/data/adminUsers';
import { radius, sans, shadow, spacing, useTheme, type Colors } from '@/theme';
import { useState } from 'react';

const ROLE_COLORS: Record<string, string> = {
  super_admin: '#B91C1C',
  content_admin: '#1A56DB',
  police_admin: '#0A1F44',
  traffic_admin: '#D97706',
  advertising_admin: '#7C3AED',
};

export default function AdminAccountsScreen() {
  const t = useT();
  const { adminUsers } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [query, setQuery] = useState('');

  const filtered = adminUsers.filter((u) => {
    const q = query.toLowerCase();
    return (
      !q ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      ROLE_LABELS[u.role].toLowerCase().includes(q)
    );
  });

  return (
    <Screen>
      <TopBar title={t('admin.police.accounts')} />

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

      <Text style={styles.summary}>
        {filtered.length} accounts · {adminUsers.filter((u) => u.isActive).length} active
      </Text>

      <View style={styles.list}>
        {filtered.map((account) => {
          const roleColor = ROLE_COLORS[account.role] ?? colors.brand;
          const lastLogin = account.lastLoginAt
            ? new Date(account.lastLoginAt).toLocaleDateString('en-RW', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : 'Never';

          return (
            <View key={account.id} style={styles.row}>
              <View style={[styles.avatar, { backgroundColor: roleColor }]}>
                <Ionicons name="person" size={18} color="#FFF" />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowName}>{account.username}</Text>
                <Text style={styles.rowEmail}>{account.email}</Text>
                <Text style={styles.rowMeta}>Last login: {lastLogin}</Text>
              </View>
              <View style={styles.badges}>
                <View style={[styles.roleBadge, { borderColor: roleColor }]}>
                  <Text style={[styles.roleText, { color: roleColor }]}>
                    {ROLE_LABELS[account.role]}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    account.isActive ? styles.activeBadge : styles.inactiveBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      account.isActive ? styles.activeText : styles.inactiveText,
                    ]}
                  >
                    {account.isActive ? 'Active' : 'Suspended'}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => {}}
                accessibilityLabel={t('admin.edit')}
                style={styles.actionBtn}
              >
                <Ionicons name="create-outline" size={18} color={colors.brand} />
              </Pressable>
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
    summary: { ...sans.tiny, color: colors.textMuted, marginBottom: spacing.sm },
    list: { gap: spacing.sm },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      ...shadow.card,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    rowBody: { flex: 1, gap: 2 },
    rowName: { ...sans.label, color: colors.text, fontSize: 13 },
    rowEmail: { ...sans.tiny, color: colors.textMuted },
    rowMeta: { ...sans.tiny, color: colors.textFaint },
    badges: { gap: spacing.xs, alignItems: 'flex-end' },
    roleBadge: {
      borderWidth: 1,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    roleText: { ...sans.tiny, fontSize: 10 },
    statusBadge: {
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    activeBadge: { backgroundColor: colors.successSoft },
    inactiveBadge: { backgroundColor: colors.emergencySoft },
    statusText: { ...sans.tiny, fontSize: 10 },
    activeText: { color: colors.success },
    inactiveText: { color: colors.emergency },
    actionBtn: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.sm,
      backgroundColor: colors.brandSoft,
      flexShrink: 0,
    },
    pressed: { opacity: 0.8 },
  });
