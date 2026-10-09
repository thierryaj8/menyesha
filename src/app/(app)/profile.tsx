import { StyleSheet, Text, View } from 'react-native';
import { LanguagePicker } from '@/components/LanguagePicker';
import { MobileHeader } from '@/components/MobileHeader';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { Button } from '@/components/Button';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { sans, spacing, useTheme, type Colors } from '@/theme';

export default function ProfileScreen() {
  const t = useT();
  const { user, adminUser, isAdmin, logout } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <Screen header={<MobileHeader />}>
      <TopBar title={t('nav.profile')} />
      <View style={styles.identity}>
        <Text style={styles.name}>{user?.username ?? adminUser?.username ?? t('nav.profile')}</Text>
        <Text style={styles.phone}>{user?.phone ?? adminUser?.email ?? ''}</Text>
        {isAdmin ? <Text style={styles.role}>{t('admin.portal')} · {adminUser?.role}</Text> : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t('common.language')}</Text>
        <LanguagePicker />
      </View>

      <Button label={t('auth.logout')} variant="secondary" onPress={logout} />
    </Screen>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  identity: { gap: spacing.xs, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  name: { ...sans.lead, color: colors.text },
  phone: { ...sans.body, color: colors.textMuted },
  role: { ...sans.small, color: colors.brandForeground },
  section: { gap: spacing.sm },
  label: { ...sans.label, color: colors.text },
});