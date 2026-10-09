import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { Note } from '@/components/Note';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { sans, serif, spacing, useTheme, type Colors } from '@/theme';

export default function VerifyScreen() {
  const t = useT();
  const { verify, pendingPhone } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  const onSubmit = async () => {
    const result = await verify(code);
    if (!result.ok && result.errorKey) setError(t(result.errorKey));
    // Success flips the app into the signed-in group.
  };

  return (
    <Screen
      footer={
        <Button label={t('verify.button')} onPress={onSubmit} disabled={code.length < 6} />
      }
    >
      <TopBar onBack={() => router.back()} />

      <View>
        <Text style={styles.title}>{t('verify.title')}</Text>
        <Text style={styles.subtitle}>
          {t('verify.subtitle', { phone: pendingPhone ?? '+250 ••• ••• •••' })}
        </Text>
      </View>

      <Field
        label={t('verify.code')}
        value={code}
        onChangeText={(text) => {
          setCode(text.replace(/\D/g, '').slice(0, 6));
          setError(null);
        }}
        placeholder={t('verify.codePlaceholder')}
        error={error}
        keyboardType="number-pad"
        autoComplete="sms-otp"
        textContentType="oneTimeCode"
        maxLength={6}
        style={styles.code}
      />

      <Text style={styles.demo}>{t('verify.demo')}</Text>

      <Note icon="shield-checkmark-outline" tone="brand">
        {t('verify.why')}
      </Note>

      <View style={styles.resendRow}>
        <Pressable
          onPress={() => setResent(true)}
          accessibilityRole="button"
          style={[styles.link, styles.linkHit]}
        >
          <Text style={styles.linkText}>{t('verify.resend')}</Text>
        </Pressable>
        {resent ? <Text style={styles.resent}>{t('verify.resent')}</Text> : null}
      </View>
    </Screen>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  title: { ...serif.h1, color: colors.text },
  subtitle: { ...sans.lead, color: colors.textMuted },
  code: {
    textAlign: 'center',
    letterSpacing: 12,
    fontSize: 28,
    fontFamily: 'Fraunces_600SemiBold',
  },
  demo: { ...sans.small, color: colors.textMuted, textAlign: 'center' },
  resendRow: { alignItems: 'center', gap: 2 },
  link: { justifyContent: 'center', paddingHorizontal: spacing.sm },
  linkHit: { minHeight: 48 },
  linkText: { ...sans.buttonSmall, color: colors.brandForeground, textDecorationLine: 'underline' },
  resent: { ...sans.small, color: colors.success },
});
