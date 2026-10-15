import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useEmergency } from '@/components/EmergencySheet';
import { Field } from '@/components/Field';
import { LanguagePicker } from '@/components/LanguagePicker';
import { Screen } from '@/components/Screen';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { HIT_SIZE, sans, serif, spacing, useTheme, type Colors } from '@/theme';

export default function LoginScreen() {
  const t = useT();
  const { login } = useApp();
  const { open: openEmergency } = useEmergency();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const onSubmit = async () => {
    setPhoneError(null);
    setPasswordError(null);
    setError(null);

    const result = await login(phone, password);
    if (!result.ok && result.errorKey) {
      if (result.errorKey === 'auth.errPassword') setPasswordError(t(result.errorKey));
      else if (result.errorKey.startsWith('auth.errPhone')) setPhoneError(t(result.errorKey));
      else setError(t(result.errorKey));
    }
  };

  const call112 = () => {
    // No login needed to reach emergency numbers.
    openEmergency();
  };

  return (
    <Screen
      footer={
        <>
          <Button label={t('auth.loginButton')} onPress={onSubmit} />
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>{t('auth.newHere')}</Text>
            <Pressable
              onPress={() => router.push('/signup')}
              accessibilityRole="link"
              style={styles.link}
            >
              <Text style={styles.linkText}>{t('auth.signupButton')}</Text>
            </Pressable>
          </View>
        </>
      }
    >
      <View style={styles.brand}>
        <Image
          source={require('../../assets/android-icon-foreground.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.wordmark}>{t('common.appName')}</Text>
        <Text style={styles.tagline}>{t('common.tagline')}</Text>
        <LanguagePicker style={styles.language} />
      </View>

      <View>
        <Text style={styles.title}>{t('auth.loginTitle')}</Text>
        <Text style={styles.subtitle}>{t('auth.loginSubtitle')}</Text>
      </View>

      <Field
        label={t('auth.phone')}
        value={phone}
        onChangeText={setPhone}
        placeholder={t('auth.phonePlaceholder')}
        error={phoneError}
        hint={t('auth.phoneCountry')}
        prefix="+250"
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
      />
      <Field
        label={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        placeholder={t('auth.passwordPlaceholder')}
        error={passwordError}
        secureTextEntry
        autoComplete="password"
        textContentType="password"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        onPress={() => {}}
        accessibilityRole="link"
        style={styles.forgotRow}
      >
        <Text style={styles.forgotText}>{t('auth.forgotPassword')}</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/staff-login' as Href)} style={styles.forgotRow}>
        <Text style={styles.forgotText}>Staff sign in</Text>
      </Pressable>
      <Card tone="emergency" style={styles.emergency}>
        <View style={styles.emergencyHead}>
          <Ionicons name="warning" size={22} color={colors.emergencyForeground} />
          <View style={styles.flex}>
            <Text style={styles.emergencyTitle}>{t('emergency.bannerTitle')}</Text>
            <Text style={styles.emergencyText}>{t('emergency.notForEmergencies')}</Text>
          </View>
        </View>
        <View style={styles.emergencyActions}>
          <Button
            label={t('emergency.call112')}
            variant="emergency"
            onPress={call112}
            icon={<Ionicons name="call" size={20} color={colors.white} />}
            style={styles.flex}
          />
          <Button
            label={t('emergency.seeAll')}
            variant="quiet"
            onPress={() => openEmergency()}
            style={styles.flex}
          />
        </View>
      </Card>
    </Screen>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  flex: { flex: 1 },
  brand: { alignItems: 'center', gap: 4, marginTop: spacing.lg },
  logoImage: {
    width: 72,
    height: 72,
    marginBottom: spacing.sm,
  },
  wordmark: { ...serif.h1, color: colors.brandForeground, letterSpacing: 4 },
  tagline: { ...sans.small, color: colors.textMuted },
  language: { marginTop: spacing.sm },
  title: { ...serif.h1, color: colors.text },
  subtitle: { ...sans.lead, color: colors.textMuted },
  error: { ...sans.small, color: colors.emergencyForeground },
  forgotRow: { alignSelf: 'flex-end', paddingVertical: spacing.xs },
  forgotText: { ...sans.label, color: colors.brandForeground, fontSize: 13 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: HIT_SIZE,
  },
  switchText: { ...sans.body, color: colors.textMuted },
  link: { padding: spacing.xs },
  linkText: { ...sans.buttonSmall, color: colors.brandForeground, textDecorationLine: 'underline' },
  emergency: { gap: spacing.sm, marginTop: spacing.sm },
  emergencyHead: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  emergencyTitle: { ...sans.buttonSmall, color: colors.emergencyForeground },
  emergencyText: { ...sans.small, color: colors.text },
  emergencyActions: { flexDirection: 'row', gap: spacing.sm },
});
