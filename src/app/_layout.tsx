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
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DesktopNav, DESKTOP_BREAKPOINT } from '@/components/DesktopNav';
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
 * Exactly one route group is available at a time:
 * signed out -> login / sign up, waiting for the SMS code -> verify, signed in -> the app.
 * Expo Router sends the user to the first available screen, so "/" always
 * lands somewhere sensible.
 */
function AuthGate() {
  const { phase } = useApp();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();

  const signedIn = phase === 'signedIn';
  const isWide = width >= DESKTOP_BREAKPOINT;

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.flex}>
        {/* Wide screens get a persistent nav bar; it carries its own language control. */}
        {signedIn && <DesktopNav />}

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

            <Stack.Protected guard={phase === 'needsVerify'}>
              <Stack.Screen name="verify" />
            </Stack.Protected>

            <Stack.Protected guard={signedIn}>
              <Stack.Screen name="(app)" />
            </Stack.Protected>

            <Stack.Screen name="+not-found" />
          </Stack>
        </View>
      </View>

      {/* One globe button for the whole app — top-right, every screen. */}
      {!(isWide && signedIn) && <TopLanguageBar />}
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
