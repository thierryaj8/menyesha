import { Stack } from 'expo-router';
import { useTheme } from '@/theme';

/**
 * Admin portal Stack navigator.
 * All admin screens live under /admin/… and share this layout.
 */
export default function AdminLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
