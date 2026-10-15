import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { useEmergency } from '@/components/EmergencySheet';
import { Field } from '@/components/Field';
import { Note } from '@/components/Note';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { useT } from '@/i18n';
import { useApp } from '@/store/AppProvider';
import { sans, serif, spacing, useTheme, type Colors } from '@/theme';

export default function SignupScreen() {
  const t = useT();
  const { signup } = useApp();
  const { open: openEmergency } = useEmergency();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const onSubmit = async () => {
    setUsernameError(null);
    setPhoneError(null);
    setPasswordError(null);

    const result = await signup({ username, phone, password });
    if (!result.ok && result.errorKey) {
      if (result.errorKey.startsWith('auth.errUsername')) setUsernameError(t(result.errorKey));
      else if (result.errorKey.startsWith('auth.errPhone')) setPhoneError(t(result.errorKey));
      else setPasswordError(t(result.errorKey));
    }
    // Success switches the app to the SMS check screen.
  };

  return (
    <Screen
      footer={
        <>
          <Button label={t('auth.signupButton')} onPress={onSubmit} />
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>{t('auth.haveAccount')}</Text>
            <Pressable
              onPress={() => router.replace('/login')}
              accessibilityRole="link"
              style={styles.link}
            >
              <Text style={styles.linkText}>{t('auth.loginButton')}</Text>
            </Pressable>
          </View>
        </>
      }
    >
      <TopBar onBack={() => router.back()} />

      <View>
        <Text style={styles.title}>{t('auth.signupTitle')}</Text>
        <Text style={styles.subtitle}>{t('auth.signupSubtitle')}</Text>
      </View>

      <Field
        label={t('auth.username')}
        value={username}
        onChangeText={setUsername}
        placeholder={t('auth.usernamePlaceholder')}
        error={usernameError}
        autoCapitalize="words"
        autoComplete="username"
        textContentType="username"
      />
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
        autoComplete="new-password"
        textContentType="newPassword"
        hint={t('auth.errPasswordShort')}
      />

      <Note icon="chatbox-ellipses-outline" tone="brand">
        {t('auth.smsNote')}
      </Note>

      <Pressable
        onPress={() => openEmergency()}
        accessibilityRole="button"
        style={styles.emergencyLink}
      >
        <Ionicons name="call" size={18} color={colors.emergencyForeground} />
        <Text style={styles.emergencyText}>{t('emergency.seeAll')}</Text>
      </Pressable>
    </Screen>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  title: { ...serif.h1, color: colors.text },
  subtitle: { ...sans.lead, color: colors.textMuted },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 48,
  },
  switchText: { ...sans.body, color: colors.textMuted },
  link: { padding: spacing.xs },
  linkText: { ...sans.buttonSmall, color: colors.brandForeground, textDecorationLine: 'underline' },
  emergencyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 48,
  },
  emergencyText: { ...sans.buttonSmall, color: colors.emergencyForeground },
});
