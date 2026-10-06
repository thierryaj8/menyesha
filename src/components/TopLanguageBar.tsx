import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LanguageMenu } from '@/components/LanguageMenu';
import { spacing } from '@/theme';

/**
 * A globe button pinned to the top-right of EVERY screen. It is mounted once
 * in the root layout, so anyone — before login or after — can switch
 * English / Kinyarwanda / French from anywhere without hunting for a tab.
 */
export function TopLanguageBar() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.pin, { top: insets.top + 6, right: spacing.gutter }]}>
      <LanguageMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  pin: { position: 'absolute', zIndex: 10 },
});