import { Stack } from 'expo-router';
import { useTheme } from '@/theme';

/** Everything behind the tab bar: the tabs plus the report flow and details. */
export default function AppLayout() {
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
