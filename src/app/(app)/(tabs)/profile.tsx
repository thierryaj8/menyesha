/**
 * Profile screen.
 * Shows user info, FixPoints summary, report count, settings
 * (language, appearance, notifications), admin portal entry, and logout.
 */
import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { LanguagePicker } from '@/components/LanguagePicker';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { HIT_SIZE, radius, sans, serif, shadow, spacing, useTheme, type Colors } from '@/theme';

export default function ProfileScreen() {
  const t = useT();
  const { user, balance, myReports, isAdmin, adminUser, logout } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  function handleLogout() {
    Alert.alert(
      t('profile.logout'),
      t('profile.logoutConfirm'),
      [
        { text: t('common.back'), style: 'cancel' },
        {
          text: t('profile.logout'),
          style: 'destructive',
          onPress: () => logout(),
        },
      ],
    );
  }

  return (
    <Screen>
      {/* Avatar + name */}
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color={colors.white} />
        </View>
        <View style={styles.heroText}>
          <Text style={styles.heroName}>{user?.username ?? 'Citizen'}</Text>
          <Text style={styles.heroPhone}>{user?.phone ?? ''}</Text>
          {isAdmin && adminUser && (
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={11} color={colors.gold} />
              <Text style={styles.adminBadgeText}>
                {adminUser.role.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Points card */}
      <Pressable
        onPress={() => router.push('/rewards' as any)}
        accessibilityRole="button"
        style={({ pressed }) => [styles.pointsCard, pressed && styles.pressed]}
      >
        <View style={styles.pointsLeft}>
          <Ionicons name="trophy" size={28} color={colors.gold} />
          <View>
            <Text style={styles.pointsLabel}>{t('profile.yourPoints')}</Text>
            <Text style={styles.pointsValue}>{balance.toLocaleString()}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
      </Pressable>

      {/* Reports */}
      <Pressable
        onPress={() => router.push('/reports' as any)}
        accessibilityRole="button"
        style={({ pressed }) => [styles.settingsRow, pressed && styles.pressed]}
      >
        <View style={styles.rowIcon}>
          <Ionicons name="file-tray-full" size={20} color={colors.brand} />
        </View>
        <View style={styles.rowBody}>
          <Text style={styles.rowTitle}>{t('profile.reportsSection')}</Text>
          <Text style={styles.rowSub}>
            {t('profile.totalReports', { count: myReports.length })}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
      </Pressable>

      {/* Divider */}
      <Text style={styles.sectionLabel}>{t('profile.settings')}</Text>

      {/* Language */}
      <View style={styles.settingsCard}>
        <View style={styles.settingsRowInner}>
          <View style={styles.rowIcon}>
            <Ionicons name="globe-outline" size={20} color={colors.brand} />
          </View>
          <Text style={styles.rowTitle}>{t('profile.language')}</Text>
        </View>
        <LanguagePicker />
      </View>

      {/* Appearance */}
      <Pressable
        onPress={() => router.push('/rewards' as any)}
        accessibilityRole="button"
        style={({ pressed }) => [styles.settingsRow, pressed && styles.pressed]}
      >
        <View style={styles.rowIcon}>
          <Ionicons name="contrast-outline" size={20} color={colors.brand} />
        </View>
        <View style={styles.rowBody}>
          <Text style={styles.rowTitle}>{t('profile.appearance')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
      </Pressable>

      {/* Admin portal — visible only to admin users */}
      {isAdmin && (
        <>
          <Text style={styles.sectionLabel}>{t('admin.portal')}</Text>
          <Pressable
            onPress={() => router.push('/admin' as any)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.settingsRow, styles.adminRow, pressed && styles.pressed]}
          >
            <View style={[styles.rowIcon, styles.adminRowIcon]}>
              <Ionicons name="settings" size={20} color={colors.white} />
            </View>
            <View style={styles.rowBody}>
              <Text style={[styles.rowTitle, { color: colors.white }]}>{t('profile.adminPortal')}</Text>
              <Text style={[styles.rowSub, { color: 'rgba(255,255,255,0.7)' }]}>
                {t('profile.adminPortalNote')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
          </Pressable>
        </>
      )}

      {/* Logout */}
      <Pressable
        onPress={handleLogout}
        accessibilityRole="button"
        style={({ pressed }) => [styles.logoutBtn, pressed && styles.pressed]}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.emergency} />
        <Text style={styles.logoutText}>{t('profile.logout')}</Text>
      </Pressable>
    </Screen>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    hero: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroText: { flex: 1, gap: spacing.xs },
    heroName: { ...serif.h2, color: colors.text },
    heroPhone: { ...sans.small, color: colors.textMuted },
    adminBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start',
      backgroundColor: colors.goldSoft,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    adminBadgeText: { ...sans.tiny, color: colors.gold },

    pointsCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.brand,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      minHeight: HIT_SIZE,
      ...shadow.raised,
    },
    pointsLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    pointsLabel: { ...sans.eyebrow, color: colors.gold, letterSpacing: 1.4 },
    pointsValue: { ...serif.h1, color: colors.white },

    sectionLabel: {
      ...sans.eyebrow,
      color: colors.textFaint,
      letterSpacing: 1.4,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },

    settingsCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      marginBottom: spacing.sm,
      ...shadow.card,
    },
    settingsRowInner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    settingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      marginBottom: spacing.sm,
      minHeight: HIT_SIZE,
      ...shadow.card,
    },
    adminRow: {
      backgroundColor: colors.brand,
      borderColor: 'transparent',
    },
    adminRowIcon: {
      backgroundColor: 'rgba(255,255,255,0.15)',
    },
    rowIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.sm,
      backgroundColor: colors.brandSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowBody: { flex: 1, gap: 2 },
    rowTitle: { ...sans.label, color: colors.text },
    rowSub: { ...sans.tiny, color: colors.textMuted },

    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: colors.emergency,
      borderRadius: radius.md,
      padding: spacing.md,
      marginTop: spacing.lg,
      minHeight: HIT_SIZE,
    },
    logoutText: { ...sans.label, color: colors.emergency },

    pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  });
