/**
 * Admin › Users & Roles
 *
 * Shows every administrator, their role, and the permission matrix each role
 * grants. Super Admin can edit role assignments; other admins can view.
 */
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { AdminCrudModal, type CrudField } from '@/components/AdminCrudModal';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { useT } from '@/i18n';
import { ROLE_LABELS } from '@/data/adminUsers';
import { useApp } from '@/store/AppProvider';
import type { AdminPermission, AdminRole, AdminUser } from '@/types';
import { HIT_SIZE, radius, sans, shadow, spacing, useTheme, type Colors } from '@/theme';
import { runCmsMutation } from '@/utils/cms';

const ROLES: AdminRole[] = [
  'super_admin',
  'content_admin',
  'police_admin',
  'traffic_admin',
  'advertising_admin',
];

const PERMISSIONS: { key: AdminPermission; labelKey: string; groupKey: string }[] = [
  { key: 'manage_departments', labelKey: 'perm.manage_departments', groupKey: 'police' },
  { key: 'manage_accounts', labelKey: 'perm.manage_accounts', groupKey: 'police' },
  { key: 'manage_announcements', labelKey: 'perm.manage_announcements', groupKey: 'police' },
  { key: 'manage_traffic_docs', labelKey: 'perm.manage_traffic_docs', groupKey: 'traffic' },
  { key: 'manage_posts', labelKey: 'perm.manage_posts', groupKey: 'content' },
  { key: 'manage_videos', labelKey: 'perm.manage_videos', groupKey: 'content' },
  { key: 'manage_photos', labelKey: 'perm.manage_photos', groupKey: 'content' },
  { key: 'manage_news', labelKey: 'perm.manage_news', groupKey: 'content' },
  { key: 'manage_newsletters', labelKey: 'perm.manage_newsletters', groupKey: 'content' },
  { key: 'manage_ads', labelKey: 'perm.manage_ads', groupKey: 'advertising' },
  { key: 'manage_banners', labelKey: 'perm.manage_banners', groupKey: 'advertising' },
  { key: 'view_analytics', labelKey: 'perm.view_analytics', groupKey: 'system' },
  { key: 'manage_roles', labelKey: 'perm.manage_roles', groupKey: 'system' },
];

/** What each role grants, used to draw the permission matrix. */
function roleGrants(role: AdminRole): AdminPermission[] {
  const sample = ROLE_SAMPLES[role];
  return sample;
}

/** Mirrors the permission sets in src/data/adminUsers.ts. */
const ROLE_SAMPLES: Record<AdminRole, AdminPermission[]> = {
  super_admin: PERMISSIONS.map((p) => p.key),
  content_admin: [
    'manage_posts',
    'manage_videos',
    'manage_photos',
    'manage_news',
    'manage_newsletters',
    'view_analytics',
  ],
  police_admin: ['manage_departments', 'manage_accounts', 'manage_announcements', 'view_analytics'],
  traffic_admin: ['manage_traffic_docs', 'manage_announcements', 'view_analytics'],
  advertising_admin: ['manage_ads', 'manage_banners', 'view_analytics'],
};

export default function AdminUsersScreen() {
  const t = useT();
  const { adminUsers, adminUser, can, updateAdminUser } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const mayEdit = can('manage_roles');
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const roleFields = (admin: AdminUser): CrudField[] => [
    { key: 'role', label: 'Role', value: admin.role, placeholder: 'content_admin' },
    { key: 'departmentId', label: 'Department ID', value: admin.departmentId ?? '', placeholder: 'Optional department ID', optional: true },
    { key: 'isActive', label: 'Active', value: String(admin.isActive), placeholder: 'true' },
  ];
  const saveRole = (values: Record<string, string>) => {
    if (!selectedAdmin) return;
    void runCmsMutation('Update account role', async () => {
      await updateAdminUser(selectedAdmin.id, {
        role: values.role.trim() as AdminRole,
        departmentId: values.departmentId.trim() || null,
        isActive: values.isActive.trim().toLowerCase() !== 'false',
      });
      setSelectedAdmin(null);
    });
  };

  return (
    <Screen>
      <TopBar title={t('admin.users.title')} />
      <Text style={styles.subtitle}>{t('admin.users.subtitle')}</Text>

      {/* Administrator list */}
      <View style={styles.list}>
        {adminUsers.map((admin) => {
          const isSelf = admin.id === adminUser?.id;
          return (
            <View key={admin.id} style={styles.row}>
              <View style={[styles.avatar, !admin.isActive && styles.avatarOff]}>
                <Ionicons name="person" size={20} color={colors.white} />
              </View>
              <View style={styles.rowBody}>
                <View style={styles.rowTitleLine}>
                  <Text style={styles.rowTitle}>{admin.username}</Text>
                  {isSelf && (
                    <View style={styles.youBadge}>
                      <Text style={styles.youText}>{t('admin.users.you')}</Text>
                    </View>
                  )}
                  {!admin.isActive && (
                    <View style={styles.offBadge}>
                      <Text style={styles.offText}>{t('admin.inactive')}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.rowMeta}>{admin.email}</Text>
                <Text style={styles.roleText}>{ROLE_LABELS[admin.role]}</Text>
                <Text style={styles.permCount}>
                  {admin.permissions.length} {t('admin.users.permissions')}
                </Text>
              </View>
              {mayEdit && (
                <Pressable onPress={() => setSelectedAdmin(admin)} style={styles.actionBtn}>
                  <Ionicons name="create-outline" size={16} color={colors.brand} />
                </Pressable>
              )}
            </View>
          );
        })}
      </View>

      {selectedAdmin ? (
        <AdminCrudModal
          visible
          title={`Edit ${selectedAdmin.username}`}
          submitLabel="Save account"
          initialValues={roleFields(selectedAdmin)}
          onClose={() => setSelectedAdmin(null)}
          onSubmit={saveRole}
        />
      ) : null}

      {/* Permission matrix */}
      <Text style={styles.sectionLabel}>{t('admin.users.matrix')}</Text>
      <View style={styles.matrix}>
        <View style={styles.matrixHeader}>
          <Text style={[styles.matrixCell, styles.matrixHead, styles.matrixPermCol]}>
            {t('admin.users.permission')}
          </Text>
          {ROLES.map((role) => (
            <Text
              key={role}
              numberOfLines={2}
              style={[styles.matrixCell, styles.matrixHead, styles.matrixRoleCol]}
            >
              {ROLE_LABELS[role].split(' ')[0]}
            </Text>
          ))}
        </View>

        {PERMISSIONS.map((permission) => (
          <View key={permission.key} style={styles.matrixRow}>
            <Text style={[styles.matrixCell, styles.matrixPermCol]} numberOfLines={2}>
              {t(permission.labelKey)}
            </Text>
            {ROLES.map((role) => {
              const granted = roleGrants(role).includes(permission.key);
              return (
                <View key={role} style={[styles.matrixCell, styles.matrixRoleCol, styles.matrixMark]}>
                  {granted ? (
                    <Ionicons name="checkmark" size={15} color={colors.success} />
                  ) : (
                    <Ionicons name="close" size={13} color={colors.textFaint} />
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.note}>
        <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
        <Text style={styles.noteText}>{t('admin.users.note')}</Text>
      </View>
    </Screen>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    subtitle: { ...sans.small, color: colors.textMuted, marginTop: -spacing.sm },
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
      minHeight: HIT_SIZE,
      ...shadow.card,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarOff: { backgroundColor: colors.textFaint },
    rowBody: { flex: 1, gap: 2 },
    rowTitleLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
    rowTitle: { ...sans.label, color: colors.text, fontSize: 13 },
    rowMeta: { ...sans.tiny, color: colors.textMuted },
    roleText: { ...sans.tiny, color: colors.accent },
    permCount: { ...sans.tiny, color: colors.textFaint },
    youBadge: {
      backgroundColor: colors.brandSoft,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 1,
    },
    youText: { ...sans.tiny, color: colors.brand, fontSize: 10 },
    offBadge: {
      backgroundColor: colors.neutralSoft,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 1,
    },
    offText: { ...sans.tiny, color: colors.neutralText, fontSize: 10 },
    actionBtn: {
      width: 34,
      height: 34,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.sm,
      backgroundColor: colors.sage,
    },
    sectionLabel: {
      ...sans.eyebrow,
      color: colors.textFaint,
      letterSpacing: 1.4,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    matrix: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    matrixHeader: {
      flexDirection: 'row',
      backgroundColor: colors.brand,
      paddingVertical: spacing.sm,
    },
    matrixRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingVertical: spacing.xs,
    },
    matrixCell: { ...sans.tiny, color: colors.text, paddingHorizontal: spacing.xs },
    matrixHead: { color: colors.white },
    matrixPermCol: { flex: 2.2 },
    matrixRoleCol: { flex: 1, textAlign: 'center' },
    matrixMark: { alignItems: 'center', justifyContent: 'center', minHeight: 26 },
    note: {
      flexDirection: 'row',
      gap: spacing.sm,
      alignItems: 'flex-start',
      backgroundColor: colors.sage,
      borderRadius: radius.md,
      padding: spacing.md,
    },
    noteText: { ...sans.tiny, color: colors.textMuted, flex: 1 },
  });