import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, type Colors } from './tokens';

export type ThemeMode = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'menyesha.theme';

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

interface ThemeValue {
  /** What the user picked: light, dark, or follow the phone. */
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  /** What is actually on screen right now. */
  isDark: boolean;
  colors: Colors;
}

/** The product experience is designed around the dark civic-safety interface. */
const ThemeContext = createContext<ThemeValue>({
  mode: 'dark',
  setMode: () => {},
  isDark: true,
  colors: darkColors,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Follow the phone until a saved choice is restored.
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const systemScheme = useColorScheme();

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (!cancelled && isThemeMode(saved)) setModeState(saved);
      })
      .catch(() => {
        // First run or storage unavailable — system setting is fine.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {
      // Saving is a nice-to-have; the in-memory choice still applies.
    });
  }, []);

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';

  const value = useMemo<ThemeValue>(
    () => ({ mode, setMode, isDark, colors: isDark ? darkColors : lightColors }),
    [mode, setMode, isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  return useContext(ThemeContext);
}
