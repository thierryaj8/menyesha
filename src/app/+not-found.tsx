import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useT } from '@/i18n';
import { serif, spacing, useTheme, type Colors } from '@/theme';

export default function NotFoundScreen() {
  const t = useT();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <Screen
      footer={<Button label={t('report.homeCta')} onPress={() => router.replace('/')} />}
    >
      <View style={styles.wrap}>
        <Text style={styles.title}>404</Text>
        <Text style={styles.text}>{t('detail.notFound')}</Text>
      </View>
    </Screen>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.sm, paddingTop: spacing.xxl },
  title: { ...serif.display, color: colors.brandForeground },
  text: { ...serif.h3, color: colors.textMuted, textAlign: 'center' },
});
