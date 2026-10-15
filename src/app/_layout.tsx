import {
  Fraunces_400Regular,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BrandedSplash } from '@/components/BrandedSplash';
import { EmergencyProvider } from '@/components/EmergencySheet';
import { TopLanguageBar } from '@/components/TopLanguageBar';
import { I18nProvider } from '@/i18n';
import { AppProvider, useApp } from '@/store/AppProvider';
import { ThemeProvider, useTheme } from '@/theme';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_400Regular,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  // Wait for the brand fonts so nothing flashes in a fallback face.
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <I18nProvider>
          <AppProvider>
            <EmergencyProvider>
              <AuthGate />
            </EmergencyProvider>
          </AppProvider>
        </I18nProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

/**
 * Citizen auth routes follow the SMS sign-in phase; staff sign-in remains
 * available independently until a staff account is authenticated.
 */
function AuthGate() {
  const { phase, staffAccount, staffReady } = useApp();
  const { colors, isDark } = useTheme();

  const signedIn = phase === 'signedIn';
  const appAvailable = signedIn || (staffReady && staffAccount !== null);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.flex}>
        {/* Wide screens get a persistent nav bar; it carries its own language control. */}

        <View style={styles.flex}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Protected guard={phase === 'signedOut'}>
              <Stack.Screen name="login" />
              <Stack.Screen name="signup" />
            </Stack.Protected>

            <Stack.Protected guard={!staffAccount}>
              <Stack.Screen name="staff-login" />
            </Stack.Protected>

            <Stack.Protected guard={phase === 'needsVerify'}>
              <Stack.Screen name="verify" />
            </Stack.Protected>

            <Stack.Protected guard={appAvailable}>
              <Stack.Screen name="(app)" />
            </Stack.Protected>

            <Stack.Screen name="+not-found" />
          </Stack>
        </View>
      </View>

      {/* Globe switcher on auth screens and wide layouts; the profile tab carries it once signed in on mobile. */}
      {phase !== 'signedIn' && !(staffReady && staffAccount) && <TopLanguageBar />}

      {/* Branded intro plays once on startup, then unmounts itself. */}
      <BrandedSplash />
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
