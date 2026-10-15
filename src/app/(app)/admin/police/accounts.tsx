/**
 * Admin › Police Management › Police Accounts
 * Manage official police communication accounts (admin users).
 */
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { TopBar } from '@/components/TopBar';
import { AdminCrudModal, type CrudField } from '@/components/AdminCrudModal';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { ROLE_LABELS } from '@/data/adminUsers';
import { radius, sans, shadow, spacing, useTheme, type Colors } from '@/theme';
import { runCmsMutation } from '@/utils/cms';
import { useState } from 'react';
import type { AdminRole, AdminUser } from '@/types';

const ROLE_COLORS: Record<string, string> = {
  super_admin: '#B91C1C',
  content_admin: '#1A56DB',
  police_admin: '#0A1F44',
  traffic_admin: '#D97706',
  advertising_admin: '#7C3AED',
};

export default function AdminAccountsScreen() {
  const t = useT();
  const { adminUsers, createAdminUser, updateAdminUser, deleteAdminUser } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState<{ open: boolean; account?: AdminUser }>({ open: false });

  const filtered = adminUsers.filter((u) => {
    const q = query.toLowerCase();
    return (
      !q ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      ROLE_LABELS[u.role].toLowerCase().includes(q)
    );
  });

  const fields = (account?: AdminUser): CrudField[] => [
    { key: 'username', label: 'Username', value: account?.username ?? '', placeholder: 'admin.username' },
    { key: 'email', label: 'Email', value: account?.email ?? '', placeholder: 'admin@example.com', keyboardType: 'email-address' },
    { key: 'role', label: 'Role', value: account?.role ?? 'content_admin', placeholder: 'content_admin' },
    { key: 'departmentId', label: 'Department ID', value: account?.departmentId ?? '', placeholder: 'rnp-hq', optional: true },
    { key: 'isActive', label: 'Active', value: account?.isActive ? 'true' : 'false', placeholder: 'true' },
    {
      key: 'password',
      label: account ? 'New password (optional)' : 'Initial password',
      value: '',
      placeholder: account ? 'Leave blank to keep current password' : 'At least 8 characters',
      optional: Boolean(account),
      secureTextEntry: true,
    },
  ];
  const submit = (values: Record<string, string>) => {
    const input = {
      username: values.username.trim(),
      email: values.email.trim(),
      role: (values.role.trim() || 'content_admin') as AdminRole,
      departmentId: values.departmentId.trim() || undefined,
      isActive: values.isActive.trim().toLowerCase() !== 'false',
      permissions: editor.account?.permissions ?? [],
    };
    const password = values.password.trim();
    if (!input.username || !input.email) return;
    if (!editor.account && !password) return;
    void runCmsMutation(editor.account ? 'Save account' : 'Create account', async () => {
      if (editor.account) {
        await updateAdminUser(editor.account.id, {
          ...input,
          ...(password ? { password } : {}),
        });
      } else {
        await createAdminUser({ ...input, password });
      }
      setEditor({ open: false });
    });
  };
  const remove = (account: AdminUser) => Alert.alert('Delete account', `Delete “${account.username}”?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => {
      void runCmsMutation('Delete account', () => deleteAdminUser(account.id));
    } },
  ]);

  return (
    <Screen>
      <TopBar title={t('admin.police.accounts')} />

      <View style={styles.actionBar}>
        <SearchBar value={query} onChangeText={setQuery} placeholder={t('admin.search')} />
        <Pressable
          onPress={() => setEditor({ open: true })}
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
              <View style={styles.actions}>
                <Pressable
                  onPress={() => setEditor({ open: true, account })}
                  accessibilityLabel={t('admin.edit')}
                  style={styles.actionBtn}
                >
                  <Ionicons name="create-outline" size={18} color={colors.brand} />
                </Pressable>
                <Pressable
                  onPress={() => remove(account)}
                  accessibilityLabel="Delete account"
                  style={[styles.actionBtn, styles.deleteAction]}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.emergency} />
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      <AdminCrudModal
        visible={editor.open}
        title={editor.account ? 'Edit account' : 'Create account'}
        submitLabel={editor.account ? 'Save changes' : 'Create account'}
        initialValues={fields(editor.account)}
        onClose={() => setEditor({ open: false })}
        onSubmit={submit}
      />
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
    actions: { flexDirection: 'row', gap: spacing.xs },
    actionBtn: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.sm,
      backgroundColor: colors.brandSoft,
      flexShrink: 0,
    },
    deleteAction: { backgroundColor: colors.emergencySoft },
    pressed: { opacity: 0.8 },
  });
