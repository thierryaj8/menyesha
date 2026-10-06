/**
 * Admin › Police Management hub.
 * Leads to departments, accounts, and announcements management.
 */
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { HIT_SIZE, radius, sans, shadow, spacing, useTheme, type Colors } from '@/theme';

export default function AdminPoliceScreen() {
  const t = useT();
  const { departments, announcements, adminUsers } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const sections = [
    {
      icon: 'shield-checkmark',
      title: t('admin.police.departments'),
      subtitle: t('admin.police.departmentsSub'),
      route: '/admin/police/departments',
      count: departments.length,
      accent: true,
    },
    {
      icon: 'people',
      title: t('admin.police.accounts'),
      subtitle: t('admin.police.accountsSub'),
      route: '/admin/police/accounts',
      count: adminUsers.length,
    },
    {
      icon: 'megaphone',
      title: t('admin.police.announcements'),
      subtitle: t('admin.police.announcementsSub'),
      route: '/admin/police/announcements',
      count: announcements.length,
    },
  ];

  return (
    <Screen>
      <TopBar title={t('admin.police.title')} />
      <View style={styles.grid}>
        {sections.map((s) => (
          <Pressable
            key={s.route}
            onPress={() => router.push(s.route as any)}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.card,
              s.accent && styles.cardAccent,
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.cardIcon, s.accent && styles.cardIconAccent]}>
              <Ionicons name={s.icon as any} size={26} color={s.accent ? colors.white : colors.brand} />
            </View>
            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, s.accent && styles.cardTitleAccent]}>{s.title}</Text>
              <Text style={[styles.cardSub, s.accent && styles.cardSubAccent]} numberOfLines={2}>
                {s.subtitle}
              </Text>
            </View>
            <View style={[styles.countBadge, s.accent && styles.countBadgeAccent]}>
              <Text style={[styles.countText, s.accent && styles.countTextAccent]}>{s.count}</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={s.accent ? 'rgba(255,255,255,0.5)' : colors.textFaint}
            />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    grid: { gap: spacing.sm, marginTop: spacing.sm },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      minHeight: HIT_SIZE,
      ...shadow.card,
    },
    cardAccent: { backgroundColor: colors.brand, borderColor: 'transparent' },
    cardIcon: {
      width: 48,
      height: 48,
      borderRadius: radius.md,
      backgroundColor: colors.brandSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardIconAccent: { backgroundColor: 'rgba(255,255,255,0.15)' },
    cardBody: { flex: 1, gap: 3 },
    cardTitle: { ...sans.label, color: colors.text },
    cardTitleAccent: { color: colors.white },
    cardSub: { ...sans.tiny, color: colors.textMuted },
    cardSubAccent: { color: 'rgba(255,255,255,0.7)' },
    countBadge: {
      backgroundColor: colors.brandSoft,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
    },
    countBadgeAccent: { backgroundColor: 'rgba(255,255,255,0.2)' },
    countText: { ...sans.tiny, color: colors.brand },
    countTextAccent: { color: 'rgba(255,255,255,0.9)' },
    pressed: { opacity: 0.85 },
  });
