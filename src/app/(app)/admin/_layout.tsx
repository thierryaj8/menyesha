import { Stack, type Href } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '@/store/AppProvider';
import { sans, spacing, useTheme } from '@/theme';

/**
 * Admin portal Stack navigator.
 * All admin screens live under /admin/… and share this layout.
 */
export default function AdminLayout() {
  const { colors } = useTheme();
  const { staffAccount, staffReady, cmsReady, cmsError, refreshCms } = useApp();

  useEffect(() => {
    if (staffReady && !staffAccount) router.replace('/staff-login' as Href);
  }, [staffAccount, staffReady]);

  if (!staffReady || (staffAccount && !cmsReady)) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.brand} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading secure CMS…</Text>
      </View>
    );
  }
  if (!staffAccount) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {cmsError ? (
        <View style={[styles.errorBar, { borderColor: colors.emergency }]}>
          <Text accessibilityRole="alert" style={[styles.errorText, { color: colors.emergency }]}>
            CMS data could not be refreshed: {cmsError}
          </Text>
          <Pressable onPress={() => {
            void refreshCms().catch((error: unknown) => {
              Alert.alert('CMS refresh failed', error instanceof Error ? error.message : 'Unable to refresh CMS data');
            });
          }}>
            <Text style={[styles.retryText, { color: colors.brand }]}>Retry</Text>
          </Pressable>
        </View>
      ) : null}
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  loadingText: { ...sans.small },
  errorBar: { borderBottomWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.xs },
  errorText: { ...sans.small },
  retryText: { ...sans.label },
});
