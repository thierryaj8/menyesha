import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { useApp } from '@/store/AppProvider';
import { sans, spacing, useTheme, type Colors } from '@/theme';

export default function StaffLoginScreen() {
  const { staffLogin } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const result = await staffLogin(username, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? 'Staff sign-in failed');
      return;
    }
    router.replace('/admin');
  };

  return (
    <Screen footer={<Button label={submitting ? 'Signing in…' : 'Sign in'} onPress={submit} disabled={submitting} />}>
      <TopBar title="Staff sign in" />
      <View style={styles.intro}>
        <Text style={styles.title}>Admin & Police CMS</Text>
        <Text style={styles.subtitle}>Use your staff account to manage official content and department records.</Text>
      </View>
      <Field
        label="Username"
        value={username}
        onChangeText={setUsername}
        placeholder="Your staff username"
        autoCapitalize="none"
        autoComplete="username"
      />
      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Your password"
        secureTextEntry
        autoComplete="password"
      />
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <Pressable onPress={() => router.replace('/login')} style={styles.citizenLink}>
        <Text style={styles.linkText}>Citizen sign in</Text>
      </Pressable>
    </Screen>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  intro: { gap: spacing.xs, marginTop: spacing.lg },
  title: { ...sans.title, color: colors.text },
  subtitle: { ...sans.small, color: colors.textMuted },
  error: { ...sans.small, color: colors.emergencyForeground },
  citizenLink: { alignSelf: 'center', paddingVertical: spacing.md },
  linkText: { ...sans.label, color: colors.brandForeground },
});
